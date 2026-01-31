
# 5. Implementation Details (Pseudocode)

## 5.2 Frontend Implementation

### 5.2.2 Supabase Client Configuration

```text
Initialize Supabase Service:
    Define 'supabaseUrl' from system environment variables
    Define 'supabaseAnonKey' from system environment variables
    
    // Validation
    If Url or Key is missing:
        Throw Configuration Error "Missing Supabase Credentials"

    Create and Export 'supabase' client instance using Url and Key

    Function GetCurrentUser():
        Call auth.getUser() method on client instance
        
        If error is returned:
             Throw exception
        Else:
             Extract 'user' object from response
             Return 'user' data

    Function GetSession():
        Call auth.getSession() method on client instance
        
        If error is returned:
             Throw exception
        Else:
             Extract 'session' object from response
             Return 'session' data
```

### 5.2.3 Authentication Logic

```text
Initialize AuthProvider:
    Set initial state for User and Session to null
    Set loading status to true

    Function Init():
        // Start initialization process
        Check Supabase client for an existing persisted session
        If session object is found and valid:
            Extract user details from session
            Update Session variable with found data
            Set User variable from session details
        Else:
            Log "No active session found"
        
        Set loading status to false to unblock UI
        
        // Register listener for future changes
        Start listening for Auth Changes (Login, Logout, TokenRefresh):
            When event triggers:
                If event is SIGNED_IN:
                    Update Session and User variables
                If event is SIGNED_OUT:
                    Clear all auth variables
                Set loading status to false

    Function Login(email, password):
        // Input Validation
        If email is empty OR not valid email format:
            Return error "Invalid Email Address"
        If password length < 6 characters:
            Return error "Password too short"

        Call Supabase login method with credentials
        Await response from server
        
        If error occurs in response:
            Log error details
            Throw exception to UI with user-friendly message
        Else:
            Return success status

    Function Logout():
        Call Supabase sign out method
        Await completion
        Reset User and Session variables to null
        Redirect user to Landing Page
```

### 5.2.4 Dashboard Layout Component

```text
Component DashboardLayout:
    Track state for MobileMenu (open/closed)
    Track state for WarningBanner (show/hide)

    Function CheckInactivity():
        Get current timestamp
        Compare with last user interaction timestamp
        Calculate difference in minutes
        
        If difference > 15 minutes:
            Set WarningBanner to Visible
            Wait 30 seconds
            If no interaction occurs:
                 Call Logout function
            Else:
                 Set WarningBanner to Hidden

    Render UI:
        // Validation check for user authenticity
        If User is not authenticated:
            Do not render content
            Redirect to Login

        // Display alerts if needed
        If WarningBanner is active:
            Display "Session expiring soon" alert at top of screen

        // Responsive Navigation Logic
        If Screen Size indicates Mobile Device:
            Show Top Header bar
            Render Hamburger Menu Button
            When Menu Button clicked -> Set MobileMenu state to Open
        
        If Screen Size indicates Desktop Device:
             Show Sidebar fixed on the left side
             Calculate margin for main content area

        Else if MobileMenu state is Open:
             Show Sidebar as an overlay drawer
             Add 'Click Outside' listener to close menu

        // Main Content Injection
        Render the Main Content Area
        Inject child components passed to layout
```

### 5.2.5 Projects Page Logic

```text
Component ProjectsPage:
    Maintain list of Repositories
    Track Sync status (loading/idle)
    Track Error Message state

    On Component Load:
        Get current user from Auth context
        // Security Validation
        If user object is null or undefined:
            Log "Unauthorized Access Attempt"
            Redirect to Login Page immediately
            Return
        Else:
            Call LoadRepositories(user.id)

    Function SyncGitHub():
        // Pre-call validation
        If Sync status is already true (Loading):
            Return (prevent double click)
            
        Set Sync status to true
        Get valid Auth Token from session
        
        Send 'Post' request to Backend Sync Service
        Await response
        
        If response status is 200 OK:
             Log "Sync Successful"
             Call LoadRepositories to refresh list
             Show success notification
        Else If response status is 401:
             Redirect to Login
        Else:
             Set Error Message state to "Failed to sync with GitHub"
        
        Set Sync status to false

    Function RequestAIDescription(repoID):
        // Input Validation
        If repoID is null or empty string:
            Show error "Invalid Repository ID"
            Return

        Get Auth Token
        Set loading state for specific card
        
        Send request to AI Service with repoID
        
        If successful:
            Receive new AI summary text
            Update the specific repository in the local list
            Show "Description Updated" toast
        Else:
            Show "AI Generation Failed" error
            
        Clear loading state
```

## 5.3 Backend Implementation

### 5.3.3 Backend Repository Sync Service

```text
API Endpoint: Sync Projects
    Input: User's Auth Token header
    
    Step 1: Request Validation
        Check if Authorization header exists
        If missing -> Return 400 Bad Request
        
        Extract Token string
        Decode the Token signature to get UserID
        If token expired or invalid -> Return 401 Unauthorized
    
    Step 2: Integration Check
        Sanitize UserID input
        Query database for 'github_integrations' matching UserID
        If record not found OR 'is_active' flag is false:
             Return 404 Error "GitHub account not connected"

    Step 3: Fetch External Data
        Get encrypted Access Token from database record
        Decrypt token using server secret
        
        Call GitHub API endpoint '/user/repos'
        If GitHub API returns 401:
            Log "Platform Token Expired"
            Return 403 Forbidden
    
    Step 4: Process & Store Data
        Initialize counter for synced items
        Loop through each repository object from GitHub:
            // Data Validation
            If repository name is empty -> Skip
            
            Fetch the raw README file content from HTML url
            Truncate README if length > 10MB (Performance safety)
            
            Prepare data object:
                Set UserID, Name, URL, Language
                Set Readme text content
                Set 'last_synced_at' to current timestamp
            
            Perform Database Upsert Operation:
                Match on 'user_id' and 'repo_id'
                Update record if it exists
                Insert new record if it doesn't
            
            Increment sync counter
    
    Return Success status with sync count
```

### 5.3.4 AI Description Generator

```text
Function GenerateSummary(text):
    // Context Validation
    If text is null or empty string:
        Return Error "No documentation content provided"
    
    If text length < 50 characters:
        Return Error "Documentation too short for summarization"

    Create strict system prompt: 
        "Summarize this following documentation into 4 professional lines.
         Do not use markdown. Do not use bullet points."
    
    Send prompt + text to Google Gemini API
    Await response
    
    If API returns "Quota Exceeded":
        Return 429 Error
    If API returns empty content:
        Return 500 Error
    Else:
        Sanitize output (remove newlines if needed)
        Return the generated text

API Endpoint: Describe Project
    Input: Repository ID, User Token

    // Authority Validation
    Verify User identity from Token
    If User is invalid -> Return 401
    
    // Resource Validation
    Sanitize Repository ID
    Fetch repository details from Database matching ID AND UserID
    If no record found -> Return 404 "Repository not found or access denied"
    
    Check if 'readme_content' field is populated
    If empty -> Return 400 "Cannot generate summary without README"
    
    // Execution
    Call GenerateSummary with the README content
    Catch any AI service errors
    
    // Persistence
    Save the result into 'description_ai' field in Database
    
    Return the new summary text to client
```

### 5.3.6 Resume Generation Service

```text
API Endpoint: Build Resume
    Input params: Job Role (Genre), Template Style
    Header: User Authorization Token

    // 1. Auth Validation
    Verify UserID from Token signature
    If invalid -> Block request

    // 2. Input Validation
    If Job Role is empty:
        Set default to "General Developer"
    
    Validate Template Style:
        Allowed values: ['modern', 'classic', 'creative']
        If input not in allowed list -> Return 400 "Invalid Template ID"

    // 3. Data Gathering Step
    Fetch full Profile from Database (Education, Experience, Skills)
    If Profile is incomplete (missing name or email):
        Return Error "Profile incomplete. Please update settings."
        
    Fetch all User Projects that have 'description_ai' populated
    If no projects found:
        Log warning "Resume generated with 0 projects"

    // 4. Video Integration Step
    For each project found:
        Construct file path based on Project ID
        Check Cloud Storage Bucket for existence of video file
        If file exists And size < 50MB:
            Generate a secure, temporary Signed URL (valid 1 hour)
            Attach URL to project data object

    // 5. Layout Logic Step
    Calculate Total Items = (Count Experience) + (Count Projects) + (Count Skills)
    Initialize Spacing Variable = "Normal"
    
    If Total Items > 15:
        Set Spacing Variable = "Compact"
    Else If Total Items < 5:
        Set Spacing Variable = "Spacious"

    // 6. PDF Rendering Step
    Select HTML Template matching 'Template Style' input
    Inject Profile, Projects, Videos, and Spacing variables
    Render HTML to PDF binary stream
    
    If PDF generation fails:
        Return 500 "PDF Engine Failure"
        
    // 7. Storage & Delivery Step
    Generate unique filename using UUID
    Upload PDF stream to Cloud Storage under user's private folder
    
    Create record in 'Documents' table:
        Set type = "resume"
        Set path = filename
        Set created_at = Now()
        
    Generate Download Link
    Return the Download URL JSON to the user
```
