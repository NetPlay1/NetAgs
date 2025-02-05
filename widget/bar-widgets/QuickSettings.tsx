import { App, Astal, Gtk, Gdk, hook } from "astal/gtk4";
import { bind, Binding, Variable, GLib, timeout, derive, exec } from "astal";
import AstalTray from "gi://AstalTray";
import AstalBattery from "gi://AstalBattery";
import AstalHyprland from "gi://AstalHyprland";
import AstalApps from "gi://AstalApps";
import Icons from "../../utils/icons";
import AstalWp from "gi://AstalWp";
import AstalBluetooth from "gi://AstalBluetooth";
import AstalMpris from "gi://AstalMpris";
import Pango from "gi://Pango";

function QuickSettings() {
  return (
    <menubutton>
      <popover>
        <box>
          <label label={"hyprsunset"} />
        </box>
      </popover>
    </menubutton>
  );
}

export default QuickSettings;
