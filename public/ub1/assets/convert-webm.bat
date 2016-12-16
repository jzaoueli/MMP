rem ffmpeg script: create webm
rem 2012, lietz@nanocosmos.de
@echo off

rem input/output files
set input="TV-100s-2110.podm.h264.mp4"
set output="TV-100s-2110.podm.h264.webm"

rem length in seconds (optional)
rem set timelength=-t 10

set dropbox_folder=%USERPROFILE%\Dropbox\Beuth\Beuth MTV\MTV Public
set ffmpeg="%dropbox_folder%\software\ffmpeg-win32\bin\ffmpeg.exe"
rem set ffmpeg="bin\ffmpeg.exe"

echo Converting %input% to %output%
if not exist %ffmpeg% goto err

%ffmpeg% %timelength% -threads 4 -i %input% -b:v 300k %output%

goto end

:err
echo ffmpeg not found: %ffmpeg%

:end
pause
