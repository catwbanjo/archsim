import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';


var term = new Terminal({
    lineHeight: 1,
    fontFamily: 'monospace',
    theme: {foreground: '#CCCCCC'},
    cursorBlink: true,
    cursorStyle: 'underline'
  });
  const fitAddon = new FitAddon();
  fitAddon.fit();
  window.addEventListener('resize', () => {
  fitAddon.fit();
  });

  setTimeout(() => {
    term.options.fontFamily = 'monospace'
    term.options.fontSize=13
  }, 333)
  setTimeout(() => {
    fitAddon.fit();

     window.dispatchEvent(new Event('resize'));
  }, 341)
  term.loadAddon(fitAddon);
  term.open(document.getElementById('terminal'));
  term.writeln("To install \x1b[38;2;23;147;209mArch Linux\x1b[0m follow the installation guide:");
  term.writeln("https://wiki.archlinux.org/title/Installation_guide");
  term.writeln("");
  term.writeln("For Wi-Fi, authenticate to the wireless network using the \x1b[35miwctl\x1b[0m utility.");
  term.writeln("For mobile broadband (WWAN) modems, connect with the \x1b[35mmmcli\x1b[0m utility.");
term.writeln("Ethernet, WLAN and WWAN interfaces using DHCP should work automatically.");
term.writeln("");
term.writeln("After connecting to the internet, the installation guide can be accessed");
term.writeln("via the convenience script \x1b[35mInstallation_guide\x1b[0m.");
const bgColors = [
  41,41,41,40,44,40,41,46,45,41,46,43,41,44,45,40,44,40,
  41,44,41,41,46,42,41,44,43,41,45,40,40,44,40,41,44,42,
  41,46,44,41,46,47
];
let line = "";
for (let bg of bgColors) {
  line += `\x1b[${bg}m \x1b[0m`;
}
term.writeln(line);
fitAddon.fit();
var dateOpt = { weekday: 'short', month: 'short', day: 'numeric' }
const currentDate = new Date();
term.writeln("Last login: " + currentDate.toLocaleDateString("en-US", dateOpt).replace(/,/g,'') + " " + currentDate.toLocaleTimeString('en-US', {hour12: false}) + " on tty1")
term.writeln("");
term.write("\x1b[91mroot\x1b[0m@archiso ~ # ")
var inputBlocked = false;
var inputBuffer = "";
var prompt = "\x1b[91mroot\x1b[0m@archiso ~ # "
var cPos = 0;
var showPrompt = true;
var currentDir = "/root"
let contents = {
  "/root": {
    "welcome.txt": {
      fx: "-",
      content: "Reminding you that you should use `how` whenever you're stuck on a stage! Have fun!"
    },
    "fizzbuzz": {
      fx: "-",
      content: "Hellooo"
    }
  }
}
let scrollback = {}
let disclaimer = document.getElementById("disclaimer")

function stripAnsi(str) {
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}
function insertCharAt(str, index, char) {
  return str.slice(0, index) + char + str.slice(index);
}

term.onData((data) => {
  var cRow = term.buffer.active.cursorY
  if (!inputBlocked) {
    switch (data) {
      case '\r':
        handle(inputBuffer);
        inputBuffer = "";
        // term.writeln("");
        cPos = 0;
        break;
      case '\x7F':
        if (cPos > 0) {
          cPos--;
          inputBuffer = inputBuffer.slice(0, cPos) + inputBuffer.slice(cPos + 1)
          term.write("\x1b[2K\r"+prompt+inputBuffer);
          term.write('\x1b[' + (cRow+1) + ';' + (stripAnsi(prompt).length+cPos+1) + 'H')
        }
        break;
    case '\x1b[D': // Left
      if (cPos > 1) cPos--;
      term.write('\x1b[' + (cRow+1) + ';' + (stripAnsi(prompt).length+cPos+1) + 'H');
      break;
    case '\x1b[C': // Right
      if (cPos < inputBuffer.length) cPos++;
      term.write('\x1b[' + (cRow+1) + ';' + (stripAnsi(prompt).length+cPos+1) + 'H');
      break;
    case '\x1b[A': // Up
      // optional: history up
      break;
    case '\x1b[B': // Down
      // optional: history down
      break;

      default:
        if (disclaimer != null) {
          disclaimer.remove();
  disclaimer = null
        }
        inputBuffer = insertCharAt(inputBuffer, cPos, data)
        cPos += stripAnsi(data).length
        term.write("\x1b[2K\r"+prompt+inputBuffer);
        term.write('\x1b[' + (cRow+1) + ';' + (stripAnsi(prompt).length+cPos+1) + 'H')
          break;
    }
  }
})

function getCd() {
  if (currentDir = "/root") {
    return "~"
  } else {
    return currentDir
  }
}
function changeDir() {
  
}

function printPrompt() {
  prompt = "\x1b[91mroot\x1b[0m@archiso " + getCd() + " # "
  term.write(prompt);
}

function printl(msg) {
  term.writeln("")
  term.write(msg)
  term.writeln("")
}

function handle(command) {
  const commands = {
    ls: (args) => {
      printl(Object.keys(contents["/root"]).join("  "));
      printPrompt()
    },
    clear: () => {
      term.reset();
      printPrompt();
    },
    cat: (args) => {
      if (!args.length) {
        printl("Not implemented yet. On a real Arch system, this would echo your inputs until cancelled.")
      }
      
      const cd = contents[currentDir];
      const file = args[0];

      if (!cd || !cd[file]) {
        printl(`cat: ${file}: No such file`);
      } else {
        printl(cd[file].content);
      }
      printPrompt();
    },
    debugargs: (args) => {
      printl(args.join(", "));
      printPrompt();
    },
    how: (args) => {
      printl("Use this command with chapters to read about it :)")
    }
  }

  const [cmd, ...args] = command.split(' ');
  if (commands[cmd]) {
    commands[cmd](args);
  } else if (cmd === '') {
    term.writeln("");
    printPrompt();
  } else {
    term.writeln("");
    term.write("-zsh: command not found: " + command);
    term.writeln("")
    printPrompt();
  }
}