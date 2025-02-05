import { App, Astal, Gtk, Gdk, hook } from "astal/gtk4";
import { bind, Binding, Variable } from "astal";
import AstalApps from "gi://AstalApps";

const Apps = new AstalApps.Apps({
  nameMultiplier: 2,
  entryMultiplier: 0,
  executableMultiplier: 2,
});

type AppButtonProps = {
  app: AstalApps.Application;
};

export const WINDOW_NAME = "runbar";
const Applications = Apps.fuzzy_query("");

function hide() {
  App.get_window(WINDOW_NAME)!.set_visible(false);
}

function AppButton({ app }: AppButtonProps) {
  return (
    <button
      hexpand
      tooltipText={app.description}
      name={app.name}
      onClicked={() => {
        hide();
        app.launch();
      }}
    >
      <box>
        <image iconName={bind(app, "iconName")} />
        <box vertical>
          <label label={bind(app, "name") || ""} hexpand />
          <label
            cssClasses={["RunBar-button-description"]}
            label={app.description || ""}
            wrap
          />
        </box>
      </box>
    </button>
  );
}

const AppButtons = Applications.map((app) => {
  return <AppButton app={app} />;
});

function filterList(text: string) {
  AppButtons.forEach((appbutton) => {
    let appName = appbutton.name.toLowerCase();
    let appDescription = appbutton.tooltipText?.toLowerCase();
    print(appbutton);
    if (appName.includes(text)) return appbutton.set_visible(true);
    appbutton.set_visible(false);
  });
}

function RunBar() {
  const Applications = Apps.fuzzy_query("");

  return (
    <window
      cssClasses={["runbar"]}
      name={WINDOW_NAME}
      application={App}
      monitor={0}
      layer={Astal.Layer.OVERLAY}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      keymode={Astal.Keymode.ON_DEMAND}
      onKeyPressed={(self, keyval) => {
        if (keyval === Gdk.KEY_Escape) {
          self.hide();
        }
      }}
    >
      <box css_classes={["RunBar-box"]} hexpand vexpand orientation={1}>
        <entry
          setup={(self) => {
            self.text = "";

            hook(self, App, "window-toggled", () => {
              self.text = "";
            });
          }}
          onNotifyText={(self) => filterList(self.text?.toLowerCase())}
        />
        <Gtk.ScrolledWindow
          vexpand
          hexpand
          widthRequest={500}
          heightRequest={550}
        >
          <box
            vexpand
            hexpand
            css_classes={["RunBar-box"]}
            vertical
            spacing={4}
          >
            {AppButtons}
          </box>
        </Gtk.ScrolledWindow>
      </box>
    </window>
  );
}

export default RunBar;
