call jpm xpi --dest-dir ./xpi --addon-dir ./src
call 7z d .\xpi\message-archive-options-5.0.2-beta1-tb.xpi bootstrap.js
rem call 7z a .\xpi\message-archive-options-5.0.1-tb.xpi .\src\manifest.json