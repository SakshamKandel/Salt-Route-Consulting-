$files = @(
    'e:\Salt Route Consulting\emails\BookingThankYou.tsx',
    'e:\Salt Route Consulting\emails\BookingRejected.tsx',
    'e:\Salt Route Consulting\emails\BookingReceived.tsx',
    'e:\Salt Route Consulting\emails\BookingCheckinReminder.tsx'
)

foreach ($file in $files) {
    $content = [IO.File]::ReadAllText($file)
    if ($content -match "import { Text } from '@react-email/components'") {
        $newContent = $content -replace "import { Text } from '@react-email/components'", "import { Text, Button } from '@react-email/components'"
        [IO.File]::WriteAllText($file, $newContent)
        Write-Output "Updated $file"
    } elseif ($content -match "import { Text, Link } from '@react-email/components'") {
        $newContent = $content -replace "import { Text, Link } from '@react-email/components'", "import { Text, Link, Button } from '@react-email/components'"
        [IO.File]::WriteAllText($file, $newContent)
        Write-Output "Updated $file"
    }
}
