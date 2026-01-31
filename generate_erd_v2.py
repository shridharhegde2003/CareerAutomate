
import graphviz

# Create the graph
dot = graphviz.Digraph('CareerAutomate_ERD', comment='CareerAutomate Database Schema')
dot.attr(rankdir='LR', size='12,8', ratio='fill', newrank='true')

# Define nodes (tables)
dot.node('profiles', '''<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0">
  <TR><TD COLSPAN="2" BGCOLOR="#EEEEEE"><B>profiles</B></TD></TR>
  <TR><TD PORT="id">id (PK)</TD><TD>uuid</TD></TR>
  <TR><TD>full_name</TD><TD>text</TD></TR>
  <TR><TD>skills</TD><TD>text[]</TD></TR>
  <TR><TD>career_preferences</TD><TD>jsonb</TD></TR>
  <TR><TD>education</TD><TD>jsonb</TD></TR>
  <TR><TD>experience</TD><TD>jsonb</TD></TR>
</TABLE>>''', shape='plaintext')

dot.node('repositories', '''<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0">
  <TR><TD COLSPAN="2" BGCOLOR="#EEEEEE"><B>repositories</B></TD></TR>
  <TR><TD PORT="id">id (PK)</TD><TD>uuid</TD></TR>
  <TR><TD PORT="user_id">user_id (FK)</TD><TD>uuid</TD></TR>
  <TR><TD>name</TD><TD>text</TD></TR>
  <TR><TD>full_name</TD><TD>text</TD></TR>
  <TR><TD>description_ai</TD><TD>text</TD></TR>
  <TR><TD>html_url</TD><TD>text</TD></TR>
  <TR><TD>genres</TD><TD>text[]</TD></TR>
</TABLE>>''', shape='plaintext')

dot.node('github_integrations', '''<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0">
  <TR><TD COLSPAN="2" BGCOLOR="#EEEEEE"><B>github_integrations</B></TD></TR>
  <TR><TD PORT="user_id">user_id (FK)</TD><TD>uuid</TD></TR>
  <TR><TD>github_username</TD><TD>text</TD></TR>
  <TR><TD>access_token</TD><TD>text</TD></TR>
  <TR><TD>installation_id</TD><TD>text</TD></TR>
</TABLE>>''', shape='plaintext')

dot.node('documents', '''<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0">
  <TR><TD COLSPAN="2" BGCOLOR="#EEEEEE"><B>documents</B></TD></TR>
  <TR><TD PORT="id">id (PK)</TD><TD>uuid</TD></TR>
  <TR><TD PORT="user_id">user_id (FK)</TD><TD>uuid</TD></TR>
  <TR><TD>name</TD><TD>text</TD></TR>
  <TR><TD>type</TD><TD>text</TD></TR>
  <TR><TD>file_url</TD><TD>text</TD></TR>
</TABLE>>''', shape='plaintext')

dot.node('certificate_documents', '''<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0">
  <TR><TD COLSPAN="2" BGCOLOR="#EEEEEE"><B>certificate_documents</B></TD></TR>
  <TR><TD PORT="id">id (PK)</TD><TD>uuid</TD></TR>
  <TR><TD PORT="user_id">user_id (FK)</TD><TD>uuid</TD></TR>
  <TR><TD>document_name</TD><TD>text</TD></TR>
  <TR><TD>verification_status</TD><TD>text</TD></TR>
  <TR><TD>file_url</TD><TD>text</TD></TR>
</TABLE>>''', shape='plaintext')

dot.node('fetched_jobs', '''<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0">
  <TR><TD COLSPAN="2" BGCOLOR="#EEEEEE"><B>fetched_jobs</B></TD></TR>
  <TR><TD PORT="id">id (PK)</TD><TD>uuid</TD></TR>
  <TR><TD>title</TD><TD>text</TD></TR>
  <TR><TD>company</TD><TD>text</TD></TR>
  <TR><TD>location</TD><TD>text</TD></TR>
  <TR><TD>source_url</TD><TD>text</TD></TR>
</TABLE>>''', shape='plaintext')

dot.node('job_search_status', '''<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0">
  <TR><TD COLSPAN="2" BGCOLOR="#EEEEEE"><B>job_search_status</B></TD></TR>
  <TR><TD PORT="id">id (PK)</TD><TD>uuid</TD></TR>
  <TR><TD PORT="user_id">user_id (FK)</TD><TD>uuid</TD></TR>
  <TR><TD PORT="job_id">job_id (FK)</TD><TD>uuid</TD></TR>
  <TR><TD>status</TD><TD>text</TD></TR>
  <TR><TD>notes</TD><TD>text</TD></TR>
</TABLE>>''', shape='plaintext')

dot.node('project_videos', '''<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0">
  <TR><TD COLSPAN="2" BGCOLOR="#EEEEEE"><B>project_videos</B></TD></TR>
  <TR><TD PORT="id">id (PK)</TD><TD>uuid</TD></TR>
  <TR><TD PORT="repo_id">repo_id (FK)</TD><TD>uuid</TD></TR>
  <TR><TD>video_url</TD><TD>text</TD></TR>
</TABLE>>''', shape='plaintext')

# Define edges (relationships)
dot.edge('profiles:id', 'repositories:user_id', label='1:N')
dot.edge('profiles:id', 'github_integrations:user_id', label='1:1')
dot.edge('profiles:id', 'documents:user_id', label='1:N')
dot.edge('profiles:id', 'certificate_documents:user_id', label='1:N')
dot.edge('profiles:id', 'job_search_status:user_id', label='1:N')
dot.edge('fetched_jobs:id', 'job_search_status:job_id', label='1:N')
dot.edge('repositories:id', 'project_videos:repo_id', label='1:1')

# Render
dot.render('D:/Mini_Project/Reports/erd_diagram_v2', format='png', cleanup=True)
