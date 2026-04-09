$ErrorActionPreference = "Stop"
Set-Location "c:\Users\saich\OneDrive\Desktop\Saicharan\pricewise\pricewise-india"

# Create frontend
New-Item -ItemType Directory -Force -Path "frontend" | Out-Null
Set-Location "frontend"
$frontendPkg = @"
{
  "name": "frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "@clerk/clerk-react": "^5.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "recharts": "^2.12.0",
    "socket.io-client": "^4.7.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "vite": "^5.0.0"
  }
}
"@
Set-Content -Path "package.json" -Value $frontendPkg

$dirs = @("src", "src/components", "src/pages", "src/services", "src/context")
foreach ($dir in $dirs) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }

$files = @("src/components/Navbar.jsx", "src/components/SearchBar.jsx", "src/components/PriceTable.jsx", "src/components/PriceChart.jsx", "src/components/BasketOptimizer.jsx", "src/components/AlertCard.jsx", "src/components/NotificationBell.jsx", "src/pages/Home.jsx", "src/pages/Results.jsx", "src/pages/Dashboard.jsx", "src/pages/AdminPanel.jsx", "src/services/api.js", "src/context/AuthContext.jsx", "src/main.jsx", "index.html", "vite.config.js", "tailwind.config.js")
foreach ($file in $files) { New-Item -ItemType File -Force -Path $file | Out-Null }

Write-Host "Installing Frontend dependencies..."
npm install

Set-Location ".."

# Create backend
New-Item -ItemType Directory -Force -Path "backend" | Out-Null
Set-Location "backend"
$backendPkg = @"
{
  "name": "backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "@clerk/express": "^1.0.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.0",
    "express": "^4.18.2",
    "express-rate-limit": "^7.1.0",
    "helmet": "^7.1.0",
    "ioredis": "^5.3.0",
    "joi": "^17.12.0",
    "jsonwebtoken": "^9.0.0",
    "mongoose": "^8.2.0",
    "node-cron": "^3.0.0",
    "nodemailer": "^6.9.0",
    "socket.io": "^4.7.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  }
}
"@
Set-Content -Path "package.json" -Value $backendPkg

$backendDirs = @("controllers", "middleware", "models", "scrapers/mock", "scrapers/real", "services", "utils", "socket")
foreach ($dir in $backendDirs) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }

$bFiles = @("controllers/priceController.js", "controllers/alertController.js", "controllers/userController.js", "controllers/adminController.js", "controllers/webhookController.js", "middleware/authenticate.js", "middleware/authorize.js", "middleware/validate.js", "middleware/rateLimiter.js", "middleware/errorHandler.js", "models/User.js", "models/Alert.js", "models/Price.js", "models/SecurityLog.js", "scrapers/mock/zomato.js", "scrapers/mock/swiggy.js", "scrapers/mock/blinkit.js", "scrapers/mock/zepto.js", "scrapers/mock/bigbasket.js", "scrapers/mock/dmart.js", "scrapers/mock/jiomart.js", "services/aggregator.js", "services/cache.js", "services/mailer.js", "services/scheduler.js", "utils/encryption.js", "utils/logger.js", "socket/index.js", "server.js")
foreach ($file in $bFiles) { New-Item -ItemType File -Force -Path $file | Out-Null }

Write-Host "Installing Backend dependencies..."
npm install

Set-Location ".."
Write-Host "Scaffolding Done"
