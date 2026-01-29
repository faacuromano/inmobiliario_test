$path = "d:\Proyectos\inmobiliarios\public\RECORRIDO_MAPA\index.html"
$content = [System.IO.File]::ReadAllText($path)

# Handle escaped quotes in JSON
# "static/media -> "/RECORRIDO_MAPA/static/media
$content = $content.Replace('\"static/', '\"/RECORRIDO_MAPA/static/')

# Also catch any remaining non-escaped ones that might start with static/ (e.g. in some JS vars if not covered)
# Be careful not to double replace if already fixed
$content = $content.Replace('"static/media', '"/RECORRIDO_MAPA/static/media')

[System.IO.File]::WriteAllText($path, $content)
Write-Host "Patched JSON paths in index.html"
