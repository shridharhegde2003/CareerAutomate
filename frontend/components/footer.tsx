export function Footer() {
  return (
    <footer className="relative border-t-2 border-blue-500/20 dark:border-blue-500/30 bg-gradient-to-b from-background to-slate-50 dark:from-background dark:to-slate-950">
      {/* Background decorative elements with better visibility */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl opacity-40 dark:opacity-25" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl opacity-40 dark:opacity-25" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        {/* Main footer content */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-8 sm:gap-12 mb-12 sm:mb-16">
          {/* Brand section */}
          <div className="sm:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center hover:shadow-lg transition-shadow">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="font-bold text-lg">CareerAutoMate</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Your AI-powered career growth platform. Automate job applications, optimize resumes, and showcase your
              GitHub projects all in one place.
            </p>
          </div>

          {/* Features Links */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Features</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="#features"
                  className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  Features
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Resources</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="#docs"
                  className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  About
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="#privacy"
                  className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  Privacy
                </a>
              </li>
              <li>
                <a
                  href="#terms"
                  className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  Terms
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider with gradient */}
        <div className="relative mb-8">
          <div className="h-px bg-gradient-to-r from-transparent via-blue-500/30 dark:via-blue-500/40 to-transparent" />
        </div>

        {/* Footer bottom */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm text-muted-foreground gap-4">
          <p>&copy; 2025 CareerAutoMate. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
