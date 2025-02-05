import { App, Astal, Gdk, Gtk, hook } from "astal/gtk4";
import { timeout } from "astal/time";
import Variable from "astal/variable";
import Brightness from "../utils/brightness";
import bind from "astal/binding";
import Wp from "gi://AstalWp";
const brightness = Brightness.get_default();
const speaker = Wp.get_default()!.get_default_speaker();

function OnScreenProgress({ visible }: { visible: Variable<boolean> }) {
  const iconName = Variable("");
  const value = Variable(0);

  let count = 0;
  function show(v: number, icon: string) {
    print("show");
    visible.set(true);
    value.set(v);
    iconName.set(icon);
    count++;
    timeout(2000, () => {
      count--;
      if (count === 0) visible.set(false);
    });
  }

  return (
    <revealer
      setup={(self) => {
        hook(self, brightness, "notify::screen", () =>
          show(brightness.screen, "display-brightness-symbolic"),
        );

        if (speaker) {
          hook(self, speaker, "notify::volume", () =>
            show(speaker.volume, speaker.volumeIcon),
          );
        }
      }}
      revealChild={visible()}
      transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
    >
      <box cssClasses={["OSD"]} vertical spacing={4}>
        <label label={value((v) => `${Math.floor(v * 100)}%`)} />
        <levelbar
          heightRequest={200}
          value={value()}
          orientation={1}
          inverted
          mode={Gtk.LevelBarMode.CONTINUOUS}
        />
        <image iconName={iconName()} />
      </box>
    </revealer>
  );
}

export default function OSD(monitor: Gdk.Monitor) {
  const visible = Variable(false);

  return (
    <window
      gdkmonitor={monitor}
      cssClasses={["OSD"]}
      namespace="osd"
      application={App}
      keymode={Astal.Keymode.ON_DEMAND}
      anchor={Astal.WindowAnchor.RIGHT}
      visible={visible()}
    >
      <OnScreenProgress visible={visible} />
    </window>
  );
}
