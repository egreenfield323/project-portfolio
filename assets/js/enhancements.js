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
			file: "rss_music_player.html",
			title: "RSS Music Player",
			img: "images/rss_music_player/rss_music_player_cover.png",
			tags: ["Vue", "Full Stack", "Auth", "AWS"],
			topics: ["programming"]
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

	/* ----- Interactive: step-through flow diagrams ----- */

	document.querySelectorAll(".flow-stepper").forEach(function (fig) {
		var groups = fig.querySelectorAll("svg [data-step]");
		var buttons = fig.querySelectorAll(".pill-row button");
		if (!groups.length || !buttons.length) return;

		function setStep(step) {
			fig.classList.toggle("stepping", step !== null);
			groups.forEach(function (g) {
				g.classList.toggle(
					"on",
					step !== null && +g.getAttribute("data-step") <= step
				);
			});
			buttons.forEach(function (b) {
				var v = b.getAttribute("data-step-btn");
				b.classList.toggle(
					"on",
					step === null ? v === "all" : +v === step
				);
			});
		}

		buttons.forEach(function (b) {
			b.addEventListener("click", function () {
				var v = b.getAttribute("data-step-btn");
				setStep(v === "all" ? null : +v);
			});
		});
	});

	/* ----- Interactive: image swap ----- */

	document.querySelectorAll(".image-swap").forEach(function (fig) {
		var img = fig.querySelector("img");
		var caption = fig.querySelector("figcaption");
		var buttons = fig.querySelectorAll(".pill-row button");
		if (!img || !buttons.length) return;

		buttons.forEach(function (b) {
			b.addEventListener("click", function () {
				if (b.classList.contains("on")) return;
				buttons.forEach(function (o) {
					o.classList.remove("on");
				});
				b.classList.add("on");
				fig.classList.add("fading");
				setTimeout(function () {
					img.src = b.getAttribute("data-src");
					if (caption && b.getAttribute("data-caption")) {
						caption.textContent = b.getAttribute("data-caption");
					}
					fig.classList.remove("fading");
				}, 200);
			});
		});
	});

	/* ----- Interactive: click-to-zoom lightbox ----- */

	document
		.querySelectorAll(".project .media img, .project .split-media img")
		.forEach(function (img) {
			img.addEventListener("click", function () {
				var box = document.createElement("div");
				box.className = "lightbox";
				var big = document.createElement("img");
				big.src = img.src;
				big.alt = img.alt || "";
				box.appendChild(big);
				document.body.appendChild(box);
				requestAnimationFrame(function () {
					box.classList.add("show");
				});

				function onKey(e) {
					if (e.key === "Escape") close();
				}
				function close() {
					box.classList.remove("show");
					document.removeEventListener("keydown", onKey);
					setTimeout(function () {
						box.remove();
					}, 250);
				}
				box.addEventListener("click", close);
				document.addEventListener("keydown", onKey);
			});
		});

	/* ----- Interactive: live demo cover ----- */

	document.querySelectorAll(".demo-cover").forEach(function (cover) {
		cover.addEventListener("click", function () {
			cover.style.opacity = "0";
			setTimeout(function () {
				cover.remove();
			}, 250);
		});
	});

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
