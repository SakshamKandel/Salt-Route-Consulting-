# Update owner pages
Get-ChildItem -Path 'e:\Salt Route Consulting\app\owner' -Recurse -Filter '*.tsx' | ForEach-Object {
    $content = [IO.File]::ReadAllText($_.FullName)
    $newContent = $content `
        -replace '#07111C', '#0C1F33' `
        -replace '#0A1826', '#102943' `
        -replace '#0F2133', '#163350' `
        -replace '#10243A', '#1B3A5C' `
        -replace '#06111D', '#0C1F33' `
        -replace '#060E18', '#0C1F33' `
        -replace '#C5A880', '#C9A96E' `
        -replace 'rgba\(197,168,128', 'rgba(201,169,110'
    if ($content -ne $newContent) {
        [IO.File]::WriteAllText($_.FullName, $newContent)
        Write-Output "Updated owner: $($_.Name)"
    }
}

# Update component files
Get-ChildItem -Path 'e:\Salt Route Consulting\components' -Recurse -Filter '*.tsx' | ForEach-Object {
    $content = [IO.File]::ReadAllText($_.FullName)
    $newContent = $content `
        -replace '#060E18', '#0C1F33' `
        -replace '#C5A880', '#C9A96E' `
        -replace '#FAFAFA', '#FBF9F4' `
        -replace '#EFEFEF', '#F5F1E8' `
        -replace '#FDFBF7', '#FBF9F4' `
        -replace '#FAF8F4', '#F5F1E8'
    if ($content -ne $newContent) {
        [IO.File]::WriteAllText($_.FullName, $newContent)
        Write-Output "Updated component: $($_.Name)"
    }
}

# Update public app pages
Get-ChildItem -Path 'e:\Salt Route Consulting\app' -Recurse -Filter '*.tsx' | ForEach-Object {
    $content = [IO.File]::ReadAllText($_.FullName)
    $newContent = $content `
        -replace '#FAFAFA', '#FBF9F4' `
        -replace '#EFEFEF', '#F5F1E8' `
        -replace '#FDFBF7', '#FBF9F4' `
        -replace '#C5A880', '#C9A96E'
    if ($content -ne $newContent) {
        [IO.File]::WriteAllText($_.FullName, $newContent)
        Write-Output "Updated app: $($_.Name)"
    }
}

# Update admin inquiry action emails
Get-ChildItem -Path 'e:\Salt Route Consulting\app\admin' -Recurse -Filter '*.ts' | ForEach-Object {
    $content = [IO.File]::ReadAllText($_.FullName)
    $newContent = $content `
        -replace '#0A1826', '#102943' `
        -replace '#d4af37', '#C9A96E' `
        -replace '#1e293b', '#1B3A5C' `
        -replace '#0f172a', '#102943'
    if ($content -ne $newContent) {
        [IO.File]::WriteAllText($_.FullName, $newContent)
        Write-Output "Updated admin: $($_.Name)"
    }
}

# Update email templates
Get-ChildItem -Path 'e:\Salt Route Consulting\emails' -Recurse -Filter '*.tsx' | ForEach-Object {
    $content = [IO.File]::ReadAllText($_.FullName)
    $newContent = $content `
        -replace '#C5A880', '#C9A96E' `
        -replace '#FDFBF7', '#FBF9F4'
    if ($content -ne $newContent) {
        [IO.File]::WriteAllText($_.FullName, $newContent)
        Write-Output "Updated email: $($_.Name)"
    }
}

Write-Output "`nColor update complete!"
