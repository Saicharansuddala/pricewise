$ErrorActionPreference = "Stop"

Set-Location "c:\Users\saich\OneDrive\Desktop\Saicharan\pricewise"
New-Item -ItemType Directory -Force -Path "pricewise-india" | Out-Null
Set-Location "pricewise-india"

New-Item -ItemType File -Force -Path ".env.example" | Out-Null
New-Item -ItemType File -Force -Path "README.md" | Out-Null
Set-Content -Path ".gitignore" -Value "node_modules/`n.env"

Write-Host "Scaffolding Frontend..."
Invoke-Expression "npx --yes create-vite@latest frontend --template react"

Set-Location "frontend"
Invoke-Expression "npm install @clerk/clerk-react tailwindcss postcss autoprefixer socket.io-client recharts"
Invoke-Expression "npx tailwindcss init -p"

New-Item -ItemType Directory -Force -Path "src/components" | Out-Null
New-Item -ItemType Directory -Force -Path "src/pages" | Out-Null
New-Item -ItemType Directory -Force -Path "src/services" | Out-Null
New-Item -ItemType Directory -Force -Path "src/context" | Out-Null

$components = @("Navbar.jsx", "SearchBar.jsx", "PriceTable.jsx", "PriceChart.jsx", "BasketOptimizer.jsx", "AlertCard.jsx", "NotificationBell.jsx")
foreach ($comp in $components) { New-Item -ItemType File -Force -Path "src/components/$comp" | Out-Null }

$pages = @("Home.jsx", "Results.jsx", "Dashboard.jsx", "AdminPanel.jsx")
foreach ($page in $pages) { New-Item -ItemType File -Force -Path "src/pages/$page" | Out-Null }

New-Item -ItemType File -Force -Path "src/services/api.js" | Out-Null
New-Item -ItemType File -Force -Path "src/context/AuthContext.jsx" | Out-Null

Set-Location ".."

Write-Host "Scaffolding Backend..."
New-Item -ItemType Directory -Force -Path "backend" | Out-Null
Set-Location "backend"
Invoke-Expression "npm init -y"
Invoke-Expression "npm install express mongoose dotenv cors helmet express-rate-limit socket.io @clerk/express ioredis node-cron nodemailer joi jsonwebtoken bcryptjs"
Invoke-Expression "npm install -D nodemon"

$backendDirs = @("controllers", "middleware", "models", "scrapers/mock", "scrapers/real", "services", "utils", "socket")
foreach ($dir in $backendDirs) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }

$controllers = @("priceController.js", "alertController.js", "userController.js", "adminController.js", "webhookController.js")
foreach ($file in $controllers) { New-Item -ItemType File -Force -Path "controllers/$file" | Out-Null }

$middlewares = @("authenticate.js", "authorize.js", "validate.js", "rateLimiter.js", "errorHandler.js")
foreach ($file in $middlewares) { New-Item -ItemType File -Force -Path "middleware/$file" | Out-Null }

$models = @("User.js", "Alert.js", "Price.js", "SecurityLog.js")
foreach ($file in $models) { New-Item -ItemType File -Force -Path "models/$file" | Out-Null }

$scrapers = @("zomato.js", "swiggy.js", "blinkit.js", "zepto.js", "bigbasket.js", "dmart.js", "jiomart.js")
foreach ($file in $scrapers) { New-Item -ItemType File -Force -Path "scrapers/mock/$file" | Out-Null }

$services = @("aggregator.js", "cache.js", "mailer.js", "scheduler.js")
foreach ($file in $services) { New-Item -ItemType File -Force -Path "services/$file" | Out-Null }

New-Item -ItemType File -Force -Path "utils/encryption.js" | Out-Null
New-Item -ItemType File -Force -Path "utils/logger.js" | Out-Null
New-Item -ItemType File -Force -Path "socket/index.js" | Out-Null
New-Item -ItemType File -Force -Path "server.js" | Out-Null

Write-Host "Scaffolding Complete!"
