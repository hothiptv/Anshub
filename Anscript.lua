-- [[ HỆ THỐNG REMOTE FARM TSB ]] --
local SERVER_URL = "https://anshub-production.up.railway.app"
_G.AutoFarmTSB = false

-- Vòng lặp kiểm tra lệnh từ Railway mỗi 5 giây
task.spawn(function()
    while true do
        local success, cmd = pcall(function()
            return game:HttpGet(SERVER_URL .. "/api/get-command")
        end)

        if success then
            if cmd == "start_farm" and not _G.AutoFarmTSB then
                _G.AutoFarmTSB = true
                print("Remote: Đã bật Auto Farm!")
            elseif cmd == "stop" and _G.AutoFarmTSB then
                _G.AutoFarmTSB = false
                print("Remote: Đã tắt Auto Farm!")
            end
        end
        task.wait(5)
    end
end)

-- Logic Farm TSB (Tự đánh chiêu)
task.spawn(function()
    while true do
        if _G.AutoFarmTSB then
            -- Giả lập nhấn phím Z, X, C, V để luyện chiêu
            local keys = {"Z", "X", "C", "V"}
            for _, key in ipairs(keys) do
                if not _G.AutoFarmTSB then break end
                game:GetService("VirtualInputManager"):SendKeyEvent(true, key, false, game)
                task.wait(0.2)
                game:GetService("VirtualInputManager"):SendKeyEvent(false, key, false, game)
                task.wait(1) -- Đợi 1 giây giữa các chiêu
            end
        end
        task.wait(1)
    end
end)

-- Chống bị Kick AFK
game:GetService("Players").LocalPlayer.Idled:Connect(function()
    game:GetService("VirtualUser"):CaptureController()
    game:GetService("VirtualUser"):ClickButton2(Vector2.new())
end)
