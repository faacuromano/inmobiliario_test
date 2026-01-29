$baseDir = "d:\Proyectos\inmobiliarios\public\RECORRIDO_MAPA"
$files = Get-ChildItem -Path $baseDir -Recurse -Include *.js, *.html, *.css

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $originalContent = $content

    # Fix specific JS patterns found in 3376.js and others
    # Fix mypath declaration without trailing slash
    $content = $content.Replace('"/static"', '"/RECORRIDO_MAPA/static"')
    $content = $content.Replace("'/static'", "'/RECORRIDO_MAPA/static'")

    # Fix concat patterns often used in webpack
    $content = $content.Replace('"/static/"', '"/RECORRIDO_MAPA/static/"')
    
    # Fix XML includes if they are hardcoded
    $content = $content.Replace('url="/static/', 'url("/RECORRIDO_MAPA/static/')

    # Fix other common path starts that might have been missed
    $content = $content.Replace('src="/static', 'src="/RECORRIDO_MAPA/static')
    $content = $content.Replace('href="/static', 'href="/RECORRIDO_MAPA/static')

    if ($content -ne $originalContent) {
        Write-Host "Patched: $($file.Name)"
        [System.IO.File]::WriteAllText($file.FullName, $content)
    }
}
