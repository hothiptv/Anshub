UI:AddTab("Home")
UI:AddButton("Copy Web", function() setclipboard(WEB_URL) end)
UI:AddButton("Hủy Kết Nối", Disconnect)
UI:AddButton("Đóng UI", Close)

UI:AddSlider("Speed", 16, 200)
UI:AddToggle("ESP Player")
UI:AddInput("Run Script")
UI:AddDropdown("Chọn Player")
