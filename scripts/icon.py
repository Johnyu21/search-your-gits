from pathlib import Path
from PIL import Image

# Only resize/encode the author-approved artwork; do not redraw the snake.
root = Path(__file__).resolve().parent.parent
with Image.open(root / 'assets' / 'icon.png') as source:
    icon = source.convert('RGBA').resize((256, 256), Image.Resampling.LANCZOS)
    icon.save(root / 'assets' / 'icon.ico', format='ICO', sizes=[
        (16, 16), (20, 20), (24, 24), (32, 32), (40, 40),
        (48, 48), (64, 64), (128, 128), (256, 256)
    ])
