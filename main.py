import pygame
import random
import sys

# 游戏常量配置
GRID_WIDTH = 25
GRID_HEIGHT = 20
TILE_SIZE = 50  # 每个格子的像素大小
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600

# 颜色配置（融入了类似 P5R 印象空间的红黑配色）
COLOR_BG = (15, 15, 15)
COLOR_WALL = (180, 20, 30)     # 红色墙壁
COLOR_FLOOR = (35, 35, 40)     # 暗色地板
COLOR_PLAYER = (255, 255, 255) # 白色主角
COLOR_EXIT = (255, 215, 0)     # 金色出口
COLOR_TEXT = (200, 200, 200)

class DungeonGame:
    def __init__(self):
        pygame.init()
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption("Procedural Dungeon - Final Project")
        self.clock = pygame.time.Clock()
        self.font = pygame.font.SysFont("Arial", 20)
        
        self.player_pos = [1, 1]
        self.exit_pos = [GRID_WIDTH - 2, GRID_HEIGHT - 2]
        self.grid = []
        
        # 启动时生成地图
        self.generate_valid_map()

    def generate_map_matrix(self):
        """核心算法：基于房间与通道的迷宫生成"""
        # 1. 初始化全为墙壁(1)的矩阵
        matrix = [[1 for _ in range(GRID_HEIGHT)] for _ in range(GRID_WIDTH)]
        
        # 2. 随机挖掘一些房间 (0为地板)
        num_rooms = random.randint(4, 7)
        rooms = []
        for _ in range(num_rooms):
            w = random.randint(3, 5)
            h = random.randint(3, 5)
            x = random.randint(1, GRID_WIDTH - w - 1)
            y = random.randint(1, GRID_HEIGHT - h - 1)
            
            for i in range(x, x + w):
                for j in range(y, y + h):
                    matrix[i][j] = 0
            rooms.append((x + w//2, y + h//2))
            
        # 3. 用通道连接房间中心点
        for i in range(len(rooms) - 1):
            x1, y1 = rooms[i]
            x2, y2 = rooms[i+1]
            
            # 横向挖掘
            for x in range(min(x1, x2), max(x1, x2) + 1):
                matrix[x][y1] = 0
            # 纵向挖掘
            for y in range(min(y1, y2), max(y1, y2) + 1):
                matrix[x2][y] = 0
                
        # 确保起点和终点是地板
        matrix[self.player_pos[0]][self.player_pos[1]] = 0
        matrix[self.exit_pos[0]][self.exit_pos[1]] = 2
        
        return matrix

    def flood_fill_check(self, matrix):
        """核心算法：Flood Fill 连通性验证"""
        visited = [[False for _ in range(GRID_HEIGHT)] for _ in range(GRID_WIDTH)]
        queue = [tuple(self.player_pos)]
        visited[self.player_pos[0]][self.player_pos[1]] = True
        
        while queue:
            cx, cy = queue.pop(0)
            if [cx, cy] == self.exit_pos:
                return True  # 能够到达出口，验证通过
                
            # 检查四个方向
            for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
                nx, ny = cx + dx, cy + dy
                if 0 <= nx < GRID_WIDTH and 0 <= ny < GRID_HEIGHT:
                    if not visited[nx][ny] and matrix[nx][ny] != 1:
                        visited[nx][ny] = True
                        queue.append((nx, ny))
        return False  # 无法到达出口

    def generate_valid_map(self):
        """循环生成，直到通过 Flood Fill 验证"""
        attempts = 0
        print("\n--- Starting Procedural Generation ---")
        while True:
            attempts += 1
            test_matrix = self.generate_map_matrix()
            if self.flood_fill_check(test_matrix):
                self.grid = test_matrix
                print(f"Success! Map generated valid on attempt #{attempts}")
                break
            else:
                print(f"Attempt #{attempts}: Map invalid (Exit blocked). Scrapping and re-rolling...")

    def handle_input(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            elif event.type == pygame.KEYDOWN: 
                if event.key == pygame.K_SPACE:
                    self.generate_valid_map()
                    self.player_pos = [1, 1]
                
                # 移动与碰撞检测
                next_x, next_y = self.player_pos[0], self.player_pos[1]
                if event.key in [pygame.K_LEFT, pygame.K_a]: next_x -= 1
                elif event.key in [pygame.K_RIGHT, pygame.K_d]: next_x += 1
                elif event.key in [pygame.K_UP, pygame.K_w]: next_y -= 1
                elif event.key in [pygame.K_DOWN, pygame.K_s]: next_y += 1
                
                # 检查是否撞墙 (1)
                if 0 <= next_x < GRID_WIDTH and 0 <= next_y < GRID_HEIGHT:
                    if self.grid[next_x][next_y] != 1:
                        self.player_pos = [next_x, next_y]

    def update(self):
        # 检查是否到达出口
        if self.player_pos == self.exit_pos:
            print("Level Cleared! Generating next floor...")
            self.generate_valid_map()
            self.player_pos = [1, 1]

    def draw(self):
        self.screen.fill(COLOR_BG)
        
        # 计算相机偏移量 (Camera Offset) - 保持玩家居中
        camera_x = SCREEN_WIDTH // 2 - (self.player_pos[0] * TILE_SIZE + TILE_SIZE // 2)
        camera_y = SCREEN_HEIGHT // 2 - (self.player_pos[1] * TILE_SIZE + TILE_SIZE // 2)
        
        # 渲染地图矩阵
        for x in range(GRID_WIDTH):
            for y in range(GRID_HEIGHT):
                tile = self.grid[x][y]
                rect = pygame.Rect(x * TILE_SIZE + camera_x, y * TILE_SIZE + camera_y, TILE_SIZE, TILE_SIZE)
                
                if tile == 1:
                    pygame.draw.rect(self.screen, COLOR_WALL, rect)
                    pygame.draw.rect(self.screen, (0, 0, 0), rect, 1)  # 墙壁边框
                elif tile == 0:
                    pygame.draw.rect(self.screen, COLOR_FLOOR, rect)
                elif tile == 2:
                    pygame.draw.rect(self.screen, COLOR_EXIT, rect)
                    
        # 渲染玩家
        player_rect = pygame.Rect(self.player_pos[0] * TILE_SIZE + camera_x + 5, 
                                  self.player_pos[1] * TILE_SIZE + camera_y + 5, 
                                  TILE_SIZE - 10, TILE_SIZE - 10)
        pygame.draw.rect(self.screen, COLOR_PLAYER, player_rect)
        
        # UI 信息提示
        info_text = self.font.render("WASD/Arrows to Move | SPACE to Regenerate Map", True, COLOR_TEXT)
        self.screen.blit(info_text, (20, 20))
        
        pygame.display.flip()

    def run(self):
        while True:
            self.handle_input()
            self.update()
            self.draw()
            self.clock.tick(60)

if __name__ == "__main__":
    game = DungeonGame()
    game.run()