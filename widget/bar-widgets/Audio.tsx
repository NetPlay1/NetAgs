import { App, Astal, Gtk, Gdk, hook } from "astal/gtk4";
import { bind, Binding, Variable, GLib } from "astal";
import Icons from "../../utils/icons";
import AstalWp from "gi://AstalWp";
import AstalMpris from "gi://AstalMpris";
import Pango from "gi://Pango";

function Audio() {
  let wp = AstalWp.get_default();
  let defualtSpeaker = wp!.get_default_speaker();
  let audio = wp!.audio;
  if (!defualtSpeaker) return <></>;
  let OpenReaveler = Variable(false);

  const SpeakerList = () => (
    <box vertical>
      {bind(audio, "speakers").as((speakers) =>
        speakers.map((speaker) => (
          <button
            hexpand
            label={speaker.name || "default"}
            onClicked={(self) => speaker.set_is_default(true)}
            setup={(self) => {
              if (speaker.isDefault) {
                self.cssClasses = ["audio-speaker-selected"];
              }

              hook(self, speaker, "notify::isDefault", () => {
                self.cssClasses = ["audio-speaker-selected"];
                if (!speaker.isDefault) {
                  self.cssClasses = [];
                }
              });
            }}
          />
        )),
      )}
    </box>
  );

  return (
    <menubutton>
      <image iconName={bind(defualtSpeaker, "volumeIcon")} />
      <popover hasArrow={false}>
        <box vertical widthRequest={300}>
          <label label="main volume" hexpand />
          <slider
            value={bind(defualtSpeaker, "volume")}
            onChangeValue={(self) => defualtSpeaker.set_volume(self.value)}
            tooltipText={bind(defualtSpeaker, "volume").as(
              (vol) => `${(vol * 100).toFixed()}%`,
            )}
          />
          {bind(audio, "streams").as((streams) =>
            streams?.map((stream) => {
              return (
                <box spacing={5} vertical>
                  <label
                    hexpand
                    maxWidthChars={12}
                    tooltipText={bind(stream, "name").as(
                      (name) => `${name || "name is null"}`,
                    )}
                    ellipsize={Pango.EllipsizeMode.END}
                    label={bind(stream, "name").as((name) => `${name}`)}
                  />
                  <slider
                    widthRequest={200}
                    value={bind(stream, "volume")}
                    onChangeValue={(self) => stream.set_volume(self.value)}
                  />
                </box>
              );
            }),
          )}
          <button
            label={bind(OpenReaveler).as((open) => {
              return open ? "⌃" : "⌄";
            })}
            onClicked={() => OpenReaveler.set(!OpenReaveler.get())}
          />
          <revealer
            revealChild={OpenReaveler()}
            onDestroy={() => OpenReaveler.drop()}
          >
            <SpeakerList />
          </revealer>
        </box>
      </popover>
    </menubutton>
  );
}

export default Audio;
