/*
	Enhancement layer — loaded on every page after main.js.
	- Injects breadcrumb, tag chips, and a "Similar Projects" grid on
	  project pages (driven by the registry below).
	- Scroll-reveal animations via IntersectionObserver.
	- Back-to-top button.
*/

(function () {
	"use strict";

	var prefersReduced =
		window.matchMedia &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	/* Topics mirror the home page filter categories and drive the
	   "Similar Projects" matching. */
	var projects = [
		{
			file: "remy.html",
			title: "Remy's Ratatouille Adventure Simulator",
			img: "images/remy.png",
			tags: ["Blender", "Python", "Ride Simulation"],
			topics: ["themed-entertainment", "programming", "animation"]
		},
		{
			file: "rcs.html",
			title: "Ride Control System",
			img: "images/rcs/rcs_thumbnail.png",
			tags: ["Vue", "JavaScript", "Ride Control"],
			topics: ["themed-entertainment", "programming"]
		},
		{
			file: "3ds_sound_software.html",
			title: "Nintendo Sound Software Re-Creation",
			img: "images/3ds_sound_software/3ds_sound_software_cover.png",
			tags: ["Reaktor 6", "Audio DSP"],
			topics: ["av-production", "programming"]
		},
		{
			file: "tcp_server.html",
			title: "TCP Client-Server File Sharing App",
			img: "images/tcp_server/tcp_server_cover.png",
			tags: ["Java", "Networking", "Multithreading"],
			topics: ["programming"]
		},
		{
			file: "mandelbrot_explorer.html",
			title: "Mandelbrot Explorer App",
			img: "images/mandelbrot_explorer/mandelbrot_explorer_cover.png",
			tags: ["Java", "Multithreading", "Graphics"],
			topics: ["programming"]
		},
		{
			file: "golang_data_manager.html",
			title: "GoLang Data Management Application",
			img: "images/golang_data_manager/golang_data_manager_cover.png",
			tags: ["Go", "MySQL"],
			topics: ["programming"]
		},
		{
			file: "welcome_inn.html",
			title: "Welcome Inn — Godot Tycoon Game",
			img: "images/welcome_inn/welcome_inn.png",
			tags: ["Godot", "GDScript", "Game Development"],
			topics: ["game-development", "programming", "av-production"]
		},
		{
			file: "live_production.html",
			title: "Live Production",
			img: "images/live_production/live_production_cover.png",
			tags: ["Audio", "Lighting", "Show Production"],
			topics: ["av-production", "themed-entertainment"]
		},
		{
			file: "music.html",
			title: "Music/Audio Production",
			img: "images/music/music_cover.png",
			tags: ["Composition", "Mixing"],
			topics: ["av-production"]
		}
	];

	var page = window.location.pathname.split("/").pop() || "index.html";
	var current = null;
	for (var i = 0; i < projects.length; i++) {
		if (projects[i].file === page) {
			current = projects[i];
			break;
		}
	}

	var inner = document.querySelector("#main > .inner");
	if (!inner) return;

	/* ----- Project page injections ----- */

	if (current) {
		var h1 = inner.querySelector("h1");

		if (h1) {
			var crumb = document.createElement("a");
			crumb.className = "project-breadcrumb";
			crumb.href = "index.html";
			crumb.innerHTML = '<span class="arrow">&larr;</span>&nbsp; All Projects';
			h1.parentNode.insertBefore(crumb, h1);

			var chips = document.createElement("div");
			chips.className = "project-tags";
			current.tags.forEach(function (tag) {
				var chip = document.createElement("span");
				chip.className = "chip";
				chip.textContent = tag;
				chips.appendChild(chip);
			});
			h1.parentNode.insertBefore(chips, h1.nextSibling);
		}

		var similar = projects
			.filter(function (p) {
				return p !== current;
			})
			.map(function (p) {
				var score = 0;
				p.topics.forEach(function (topic) {
					if (current.topics.indexOf(topic) !== -1) score++;
				});
				return { project: p, score: score };
			})
			.sort(function (a, b) {
				return b.score - a.score;
			})
			.slice(0, 3);

		var section = document.createElement("section");
		section.className = "similar-projects";
		section.innerHTML =
			"<h2>Similar Projects</h2>" +
			'<div class="similar-grid">' +
			similar
				.map(function (entry) {
					var p = entry.project;
					return (
						'<a class="similar-card" href="' + p.file + '">' +
						'<span class="sc-thumb"><img src="' + p.img +
						'" alt="" loading="lazy" /></span>' +
						'<span class="sc-body">' +
						'<span class="sc-title">' + p.title + "</span>" +
						'<span class="sc-tags">' + p.tags.join(" · ") + "</span>" +
						"</span>" +
						"</a>"
					);
				})
				.join("") +
			"</div>";
		inner.appendChild(section);
	}

	/* ----- Scroll reveal ----- */

	if (!prefersReduced && "IntersectionObserver" in window) {
		var targets = [];
		var tiles = document.querySelectorAll(".tiles article");

		if (tiles.length) {
			for (var t = 0; t < tiles.length; t++) {
				tiles[t].style.transitionDelay = (t % 3) * 90 + "ms";
				targets.push(tiles[t]);
			}
		} else {
			var children = inner.children;
			for (var c = 0; c < children.length; c++) {
				var tag = children[c].tagName;
				if (tag === "SCRIPT" || tag === "STYLE" || tag === "LINK") continue;
				targets.push(children[c]);
			}
		}

		targets.forEach(function (el) {
			el.classList.add("reveal");
		});

		var observer = new IntersectionObserver(
			function (entries) {
				entries.forEach(function (entry) {
					if (!entry.isIntersecting) return;
					var el = entry.target;
					el.classList.add("visible");
					observer.unobserve(el);
					// Clear the stagger delay once revealed so hover
					// transitions respond immediately afterwards.
					setTimeout(function () {
						el.style.transitionDelay = "";
					}, 1000);
				});
			},
			{ threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
		);

		targets.forEach(function (el) {
			observer.observe(el);
		});
	}

	/* ----- Back-to-top button ----- */

	var toTop = document.createElement("button");
	toTop.className = "to-top";
	toTop.innerHTML = "&uarr;";
	toTop.setAttribute("aria-label", "Back to top");
	toTop.addEventListener("click", function () {
		window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
	});
	document.body.appendChild(toTop);

	window.addEventListener(
		"scroll",
		function () {
			toTop.classList.toggle("show", window.scrollY > 500);
		},
		{ passive: true }
	);
})();
