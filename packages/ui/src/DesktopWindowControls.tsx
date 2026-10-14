import { useEffect, useState } from "react";
import { DesktopCommandIds } from "@zcode/shared";
import { MinusIcon, XIcon } from "lucide-react";
import { WindowMaximizeIcon, WindowRestoreIcon } from "@/components/icons/windowIcons.js";
import { Button } from "@/components/ui/button.js";
import { usePlatform } from "@/hooks/usePlatform.js";
import { useZCodeIntl } from "@/i18n/IntlProvider.js";
import { logger } from "@/logger.js";

export function DesktopWindowControls() {
  const platform = usePlatform();
  const { intl } = useZCodeIntl();
  const [maximized, setMaximized] = useState(false);
  useEffect(() => {
    let disposed = false;
    let receivedEvent = false;
    const unsubscribe = platform.onDesktopWindowChromeStateChanged?.((state) => {
      receivedEvent = true;
      if (!disposed) setMaximized(state.isMaximized);
    });
    // 订阅后读取初态；较晚返回的初态不能覆盖用户刚触发的最大化事件。
    void platform
      .getDesktopWindowChromeState?.()
      .then((state) => {
        if (!disposed && !receivedEvent) setMaximized(state.isMaximized);
      })
      .catch((error) => logger.warn("读取自绘窗口按钮状态失败", { error }));
    return () => {
      disposed = true;
      unsubscribe?.();
    };
  }, [platform]);
  // Wayland 使用原生窗口边框时系统已绘制最小化/最大化/关闭，renderer 再画会出现两套按钮。
  // 这里是所有自绘窗控的唯一出口，作为兜底避免个别调用方漏掉 hasNativeWindowFrame 判断。
  if (platform.hasNativeWindowFrame) {
    return null;
  }
  const items = [
    {
      id: "minimize",
      label: "titleBar.window.minimize",
      command: DesktopCommandIds.MinimizeWindow,
      Icon: MinusIcon,
    },
    {
      id: "maximize",
      label: "titleBar.window.toggleMaximize",
      command: DesktopCommandIds.ToggleMaximizeWindow,
      Icon: maximized ? WindowRestoreIcon : WindowMaximizeIcon,
    },
    {
      id: "close",
      label: "titleBar.menu.file.closeWindow",
      command: DesktopCommandIds.CloseWindow,
      Icon: XIcon,
    },
  ] as const;
  return (
    <div
      data-testid="desktop-window-controls"
      className="flex shrink-0 items-center gap-0.5 [app-region:no-drag]"
    >
      {items.map(({ id, label, command, Icon }) => (
        <Button
          key={id}
          type="button"
          variant="ghost"
          size="icon-md"
          data-testid={`window-control-${id}`}
          data-maximized={id === "maximize" ? maximized : undefined}
          className={`text-foreground [app-region:no-drag] ${id === "close" ? "hover:bg-destructive hover:text-destructive-foreground" : "hover:bg-hover hover:text-foreground"}`}
          aria-label={intl.formatMessage({ id: label })}
          onClick={() => {
            void platform
              .executeDesktopCommand(command)
              .catch((error) => logger.warn("执行窗口操作失败", { command, error }));
          }}
        >
          <Icon className="size-4" />
        </Button>
      ))}
    </div>
  );
}
