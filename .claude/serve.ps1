$root = Split-Path -Parent $PSScriptRoot
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8177/")
$listener.Start()
$mime = @{ ".html"="text/html"; ".js"="application/javascript"; ".css"="text/css"; ".hdr"="application/octet-stream"; ".png"="image/png"; ".jpg"="image/jpeg"; ".json"="application/json" }
while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $req = $ctx.Request
  $res = $ctx.Response
  $path = [System.Uri]::UnescapeDataString($req.Url.AbsolutePath)
  if ($path -eq "/") { $path = "/index.html" }
  $file = Join-Path $root ($path.TrimStart("/"))
  if (Test-Path $file -PathType Leaf) {
    $ext = [System.IO.Path]::GetExtension($file)
    $ct = $mime[$ext]
    if (-not $ct) { $ct = "application/octet-stream" }
    $res.ContentType = $ct
    $bytes = [System.IO.File]::ReadAllBytes($file)
    $res.ContentLength64 = $bytes.Length
    $res.OutputStream.Write($bytes, 0, $bytes.Length)
  } else {
    $res.StatusCode = 404
  }
  $res.OutputStream.Close()
}
