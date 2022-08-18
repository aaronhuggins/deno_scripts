import Gtk from "https://gir.deno.dev/Gtk-4.0";

const app = new Gtk.Application();

app.on("activate", () => {
  const win = new Gtk.ApplicationWindow({ application: app });
  const contentArea = new Gtk.Box();
  const label = new Gtk.Label({ label: "Hello World!" });

  contentArea.append(label);
  win.setChild(contentArea);
  win.show();
});

app.run([]);
