import { App, Astal, Gtk, Gdk, hook } from "astal/gtk4";
import { bind, Binding, Variable, GLib, timeout, derive } from "astal";
import Icons from "../../utils/icons";
import AstalBluetooth from "gi://AstalBluetooth";
import AstalMpris from "gi://AstalMpris";
import Pango from "gi://Pango";
function Bluetooth() {
  let bluetooth = AstalBluetooth.get_default();

  return (
    <menubutton>
      <image iconName={"network-bluetooth-symbolic"} />
      <popover hasArrow={false}>
        <box vertical>
          <label label={"devices"} />
          {bind(bluetooth, "devices").as((devices) =>
            devices.map((device) => {
              return (
                <button
                  setup={(self) => {
                    if (device.connected) {
                      self.cssClasses = ["bluetooth-connected"];
                    }

                    hook(self, device, "notify::connected", () => {
                      self.cssClasses = ["bluetooth-connected"];
                      if (!device.connected) {
                        self.cssClasses = [];
                      }
                    });
                  }}
                  onClicked={() => {
                    if (device.connected) {
                      device.disconnect_device(() => {});
                      return;
                    }
                    timeout(100, () => device.connect_device(() => {}));
                  }}
                >
                  <box>
                    <image iconName={bind(device, "icon")} />
                    <label label={bind(device, "name")} hexpand />
                    <label
                      hexpand
                      halign={Gtk.Align.END}
                      visible={bind(device, "connected")}
                      label={bind(device, "batteryPercentage").as(
                        (bat) => `${Math.floor(bat * 100)}%`,
                      )}
                    />
                  </box>
                </button>
              );
            }),
          )}
        </box>
      </popover>
    </menubutton>
  );
}

export default Bluetooth;
