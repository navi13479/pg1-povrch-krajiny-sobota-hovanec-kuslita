import math

import numpy as np
import matplotlib.pyplot as plt
from scipy.ndimage import gaussian_filter


def generate_terrain(size):
    terrain = np.zeros(size)
    num_mountains = int(2 + 16 * math.log10(size[1] / 100 + 1))
    for _ in range(num_mountains):
        mountain = gaussian_filter(np.random.normal(size=size, scale=50), sigma=int(size[0]/num_mountains))
        terrain += mountain

    return terrain


def plot_terrain(terrain,num):
    fig = plt.figure(figsize=(10, 10))
    plt.imshow(terrain, cmap='gray', interpolation='bicubic')
    plt.axis('off')
    plt.savefig(f'maps/map-{num}.png', bbox_inches='tight', transparent=True, pad_inches=-0.1, dpi=600)
    plt.close()


for map in range(100):

    terrain_size = (1000, 1000)
    generated_terrain = generate_terrain(terrain_size)
    plot_terrain(generated_terrain,map)
