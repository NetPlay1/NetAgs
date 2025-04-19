import { App, Astal, Gtk, Gdk, hook } from "astal/gtk4";
import { bind, Variable, GLib, derive } from "astal";
import AstalTray from "gi://AstalTray";
import AstalBattery from "gi://AstalBattery";
import AstalHyprland from "gi://AstalHyprland";
import AstalApps from "gi://AstalApps";
import Icons from "../utils/icons";
import Audio from "./bar-widgets/Audio";
import Brightness from "../utils/brightness";
import Bluetooth from "./bar-widgets/Bluetooth";

const time = Variable("").poll(1000, "date +'%H:%M - %a'");
const Applications = AstalApps.Apps.new();

function Battery() {
  const battery = AstalBattery.get_default();
  const brightness = new Brightness();

  return (
    <menubutton>
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
          label={bind(battery, "percentage").as(
            (p) => `${Math.floor(p * 100)}%`,
          )}
        />
      </box>
      <popover hasArrow={false} widthRequest={200}>
        <box vertical>
          <label label={"brightness"} />
          <box>
            <slider
              hexpand
              drawValue={false}
              value={bind(brightness, "value")}
              onValueChanged={(self) => (brightness.value = self.value)}
              tooltipText={bind(brightness, "value").as(
                (val) => `${Math.floor(val * 100)}%`,
              )}
            />
          </box>
        </box>
      </popover>
    </menubutton>
  );
}

function Tray() {
  const tray = AstalTray.get_default();

  return (
    <box cssClasses={["Tray-container"]}>
      {bind(tray, "items").as((items) =>
        items.map((item) => (
          <box cssClasses={["Tray-item"]} hexpand vexpand>
            <menubutton
              tooltipMarkup={bind(item, "tooltipMarkup")}
              setup={(self) => {
                // Initialize the menu model
                self.menu_model = item.menu_model || null;

                // Update menu model when it changes
                const updateMenuModel = () => {
                  self.menu_model = item.menu_model || null;
                };

                // Setup action group
                const updateActionGroup = () => {
                  self.insert_action_group(
                    "dbusmenu",
                    item.action_group || null,
                  );
                };

                // Initial setup
                updateActionGroup();

                // Setup change monitoring
                hook(self, item, "notify::menu-model", updateMenuModel);
                hook(self, item, "notify::action-group", updateActionGroup);
              }}
            >
              <image gicon={bind(item, "gicon")} hexpand vexpand />
            </menubutton>
          </box>
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
                <box hexpand vexpand cssClasses={["Clients-icon"]}>
                  <image iconName={IconName} />
                </box>
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
      <centerbox cssClasses={["centerbox"]}>
        <box vexpand hexpand halign={Gtk.Align.START} cssClasses={["Left"]}>
          <Workespaces />
          <Clients />
        </box>
        <box hexpand halign={Gtk.Align.CENTER} css_classes={["Center"]}>
          <menubutton hexpand>
            <label label={time()} onDestroy={() => time.drop()} />
            <popover hasArrow={false}>
              <Gtk.Calendar />
            </popover>
          </menubutton>
        </box>
        <box hexpand halign={Gtk.Align.END} cssClasses={["Right"]}>
          <Bluetooth />
          <Audio />
          <Tray />
          <Battery />
        </box>
      </centerbox>
    </window>
  );
}
