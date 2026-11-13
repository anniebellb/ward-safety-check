"""Build the game: assemble the skill's source parts and inline three.js into one self-contained index.html.

Source:  plugins/walkaround-safety-sim/skills/walkaround-safety-sim/assets/game/parts/
Output:  index.html (the playable game, also what GitHub Pages serves)
"""
from pathlib import Path
here = Path(__file__).parent
game = here / "plugins/walkaround-safety-sim/skills/walkaround-safety-sim/assets/game"
src = "".join((game / p).read_text() for p in ["parts/a-head.html", "parts/b-engine.js", "parts/c-game.js"])
three = (game / "vendor/three.r128.min.js").read_text()
tag = '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>'
assert tag in src, "three.js script tag not found in a-head.html"
out = src.replace(tag, "<script>/* three.js r128, MIT License, Copyright 2010-2021 Three.js Authors, https://threejs.org */\n" + three + "\n</script>")
(here / "index.html").write_text(out)
print("wrote index.html", len(out.encode()) // 1024, "KB")
