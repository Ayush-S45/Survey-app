# PowerShell script to start the development environment
Write-Host "Starting Employee Feedback System..." -ForegroundColor Green

# Start backend
Write-Host "Starting backend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend
Write-Host "Starting frontend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend/client; npm start"

Write-Host "Development servers started!" -ForegroundColor Green
Write-Host "Backend: http://localhost:5001" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan 