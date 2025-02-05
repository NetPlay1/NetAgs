import { App, Astal, Gtk, Gdk, hook } from "astal/gtk4";
import { bind, Binding, Variable, GLib, timeout, derive } from "astal";
import AstalTray from "gi://AstalTray";
import AstalBattery from "gi://AstalBattery";
import AstalHyprland from "gi://AstalHyprland";
import AstalApps from "gi://AstalApps";
import Icons from "../utils/icons";
import Pango from "gi://Pango";
import Audio from "./bar-widgets/Audio";
import Bluetooth from "./bar-widgets/Bluetooth";
import QuickSettings from "./bar-widgets/QuickSettings";
const time = Variable("").poll(1000, "date +'%H:%M - %a'");
const Applications = AstalApps.Apps.new();

function Battery() {
  const battery = AstalBattery.get_default();

  return (
    <box
      cssClasses={["Battery-box"]}
      visible={bind(battery, "isPresent")}
      tooltipMarkup={bind(battery, "time_to_empty").as(
        (time) =>
          `hr: ${Math.floor(time / 60.0 / 60.0)}, min: ${Math.floor(time % 60.0)} left`,
      )}
    >
      <image iconName={bind(battery, "batteryIconName")} />
      <label
        label={bind(battery, "percentage").as((p) => `${Math.floor(p * 100)}%`)}
      />
    </box>
  );
}

function Tray() {
  const tray = AstalTray.get_default();
  return (
    <box cssClasses={["Tray-contain"]}>
      {bind(tray, "items").as((items) =>
        items.map((item) => (
          <menubutton
            cssClasses={["Tray-item"]}
            tooltipMarkup={bind(item, "tooltipMarkup")}
            menuModel={bind(item, "menuModel")}
            setup={(self) =>
              hook(self, item, "notify::action-group", () =>
                self.insert_action_group("dbusmenu", item.action_group),
              )
            }
          >
            <image gicon={bind(item, "gicon")} />
          </menubutton>
        )),
      )}
    </box>
  );
}

function Workespaces() {
  const hyprland = AstalHyprland.get_default();

  return (
    <box cssClasses={["Worksapces-box"]}>
      {bind(hyprland, "workspaces").as((workespaces) => {
        return workespaces
          .sort((a, b) => a.id - b.id)
          .map((workspace) => {
            return (
              <button
                cssClasses={bind(hyprland, "focusedWorkspace").as((focused) =>
                  workspace === focused
                    ? ["Worksapces-button-hover"]
                    : ["Worksapces-button"],
                )}
                label={workspace.get_name()}
                onClicked={() => workspace.focus()}
              />
            );
          });
      })}
    </box>
  );
}

function Clients() {
  const hyprland = AstalHyprland.get_default();

  return (
    <box cssClasses={["Clients-box"]}>
      {bind(hyprland, "clients").as((clients) => {
        return clients
          .sort((a, b) => a.workspace.id - b.workspace.id)
          .map((client) => {
            const [app] = Applications.fuzzy_query(client.get_class() || "");
            const IconName = app ? app.iconName : Icons.apps.missingIcon;
            return (
              <button
                cssClasses={bind(hyprland, "focusedClient").as(
                  (foucsedClient) => {
                    if (client === foucsedClient)
                      return ["Clients-item-focused"];
                    return ["Clients-item"];
                  },
                )}
                onClicked={() => {
                  return client.focus();
                }}
                tooltipText={bind(client, "title")}
              >
                <image cssClasses={["Clients-icon"]} iconName={IconName} />
              </button>
            );
          });
      })}
    </box>
  );
}

export default function Bar(gdkmonitor: Gdk.Monitor) {
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;

  return (
    <window
      visible
      cssClasses={["Bar"]}
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={TOP | LEFT | RIGHT}
      application={App}
    >
      <centerbox cssName="centerbox">
        <box vexpand hexpand halign={Gtk.Align.START} cssName="Left">
          <Workespaces />
          <Clients />
        </box>
        <box hexpand halign={Gtk.Align.CENTER} cssName="Center">
          <menubutton hexpand>
            <label label={time()} onDestroy={() => time.drop()} />
            <popover>
              <Gtk.Calendar />
            </popover>
          </menubutton>
        </box>
        <box hexpand halign={Gtk.Align.END} cssName="Right">
          <Bluetooth />
          <Audio />
          <Tray />
          <Battery />
          {/* <QuickSettings /> */}
        </box>
      </centerbox>
    </window>
  );
}
