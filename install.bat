@echo off
echo Installing dependencies...
npm config set fund false
call npm install
echo Installing shadcn components...
call npx shadcn@latest add form button input select table popover command dialog label -y
echo Installation complete!
