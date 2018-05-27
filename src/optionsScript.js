			// Saves options to localStorage.
			function save_options() {
				var radio_openingComportment = document.querySelector('input[name=openingComportment]:checked');
				var checkbox_openvisitedlinks = document.getElementById("openvisitedlinks");
				var checkbox_opennsfwlinks = document.getElementById("opennsfwlinks");
				var checkbox_openlinksdirectly = document.getElementById("openlinksdirectly");
				var input_tabslimit = document.getElementById("tabslimit");
				var input_keyboardshortcut = document.getElementById("keyboardshortcut");

				if(isNaN(input_tabslimit.value)) {
					alert("Only Integer for New Tabs Limit !");
					input_tabslimit.value = localStorage["tabslimit"];
					return;
				}

				localStorage["openingComportment"] = radio_openingComportment.value;
				localStorage["openvisitedlinks"] = checkbox_openvisitedlinks.checked;
				localStorage["opennsfwlinks"] = checkbox_opennsfwlinks.checked;
				localStorage["openlinksdirectly"] = checkbox_openlinksdirectly.checked;
				localStorage["tabslimit"] = input_tabslimit.value;

				localStorage["oldkeyboardshortcut"] = localStorage["keyboardshortcut"];

				localStorage["keyboardshortcut"] = input_keyboardshortcut.value;

				var bg = chrome.extension.getBackgroundPage();

				bg.updateSettings();

				// Update status to let user know options were saved.
				var status = document.getElementById("status");
				status.innerHTML = '<span style="color:#FF0000">Options Saved.</span><br>';
				setTimeout(function() {
					status.innerHTML = "";
				}, 750);
			}

			// Restores select box state to saved value from localStorage.
			function restore_options() {
				var openingComportment = localStorage["openingComportment"];
				var openvisitedlinks = localStorage["openvisitedlinks"];
				var opennsfwlinks = localStorage["opennsfwlinks"];
				var openlinksdirectly = localStorage["openlinksdirectly"];
				var tabslimit = localStorage["tabslimit"];
				var keyboardshortcut = localStorage["keyboardshortcut"];

				var radio_openingComportment = document.getElementById(openingComportment);
				var checkbox_openvisitedlinks = document.getElementById("openvisitedlinks");
				var checkbox_opennsfwlinks = document.getElementById("opennsfwlinks");
				var checkbox_openlinksdirectly = document.getElementById("openlinksdirectly");
				var input_tabslimit = document.getElementById("tabslimit");
				var input_keyboardshortcut = document.getElementById("keyboardshortcut");

				radio_openingComportment.checked = true;
				checkbox_openvisitedlinks.checked = (openvisitedlinks == "true");
				checkbox_opennsfwlinks.checked = (opennsfwlinks == "true");
				checkbox_openlinksdirectly.checked = (openlinksdirectly == "true");
				input_tabslimit.value = tabslimit;
				input_keyboardshortcut.value = keyboardshortcut;
			}

function clickHandler(e) {
  setTimeout(save_options, 0);
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('button').addEventListener('click', clickHandler);
  restore_options();
});