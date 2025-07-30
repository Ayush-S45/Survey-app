# PowerShell script to restart the backend server
Write-Host "Restarting backend server..." -ForegroundColor Yellow

# Kill any process using port 5001
Write-Host "Killing processes on port 5001..." -ForegroundColor Red
$processes = netstat -ano | findstr :5001
if ($processes) {
    $processes | ForEach-Object {
        $parts = $_ -split '\s+'
        $processId = $parts[4]
        if ($processId -and $processId -ne "0") {
            Write-Host "Killing process $processId" -ForegroundColor Red
            taskkill /PID $processId /F 2>$null
        }
    }
}

# Wait a moment
Start-Sleep -Seconds 2

# Start the backend server
Write-Host "Starting backend server..." -ForegroundColor Green
cd backend
npm run dev 