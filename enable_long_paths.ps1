# Enable Windows Long Paths
# Run this as Administrator

New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" `
    -Name "LongPathsEnabled" `
    -Value 1 `
    -PropertyType DWORD `
    -Force

Write-Host "✅ Long paths enabled successfully!"
Write-Host "⚠️  Please restart your computer for changes to take effect."
Write-Host ""
Write-Host "After restart, run:"
Write-Host "cd C:\attendify\backend"
Write-Host "pip install deepface opencv-python fastapi uvicorn supabase python-dotenv"
