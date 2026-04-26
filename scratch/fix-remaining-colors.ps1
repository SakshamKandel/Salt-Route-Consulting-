# Fix email templates - replace generic grays with navy-tinted muted tones
Get-ChildItem -Path 'e:\Salt Route Consulting\emails' -Recurse -Filter '*.tsx' | ForEach-Object {
    $content = [IO.File]::ReadAllText($_.FullName)
    $newContent = $content `
        -replace '#7A7A7A', '#5A7A9A' `
        -replace '#5A5A5A', '#4A6A85' `
        -replace '#4A4A4A', '#3A5A75'
    if ($content -ne $newContent) {
        [IO.File]::WriteAllText($_.FullName, $newContent)
        Write-Output "Updated email: $($_.Name)"
    }
}

# Fix admin inquiry inline emails
Get-ChildItem -Path 'e:\Salt Route Consulting\app\admin' -Recurse -Filter '*.ts' | ForEach-Object {
    $content = [IO.File]::ReadAllText($_.FullName)
    $newContent = $content `
        -replace '#f8fafc', '#FBF9F4' `
        -replace '#e2e8f0', '#E8E2D6' `
        -replace '#64748b', '#5A7A9A'
    if ($content -ne $newContent) {
        [IO.File]::WriteAllText($_.FullName, $newContent)
        Write-Output "Updated admin: $($_.Name)"
    }
}

Write-Output "`nRemaining color fixes complete!"
