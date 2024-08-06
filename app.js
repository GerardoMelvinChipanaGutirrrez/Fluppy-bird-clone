let config = {
  renderer: Phaser.AUTO,  // Selecciona automáticamente el renderizador (WebGL o Canvas)
  width: 800,  // Ancho del juego
  height: 600,  // Altura del juego
  physics: {
    default: "arcade",  // Motor de física por defecto
    arcade: {
      gravity: { y: 300 },  // Gravedad en el eje Y
      debug: false,  // Desactiva el modo de depuración
    },
  },
  scene: {
    preload: preload,  // Función para cargar recursos
    create: create,  // Función para crear objetos en la escena
    update: update,  // Función para actualizar la lógica del juego
  },
};

let game = new Phaser.Game(config);  // Crear el juego con la configuración especificada

function preload() {
  // Cargar imágenes y sprites
  this.load.image("background", "assets/background.png");
  this.load.image("road", "assets/road.png");
  this.load.image("column", "assets/column.png");
  this.load.spritesheet("bird", "assets/bird.png", {
    frameWidth: 64,  // Ancho del cuadro del sprite
    frameHeight: 96,  // Altura del cuadro del sprite
  });
}

var bird;
let hasLanded = false;  // Indica si el pájaro ha aterrizado
let cursors;
let hasBumped = false;  // Indica si el pájaro ha chocado
let isGameStarted = false;  // Indica si el juego ha comenzado
let messageToPlayer;  // Mensaje para el jugador

function create() {
  // Agregar la imagen de fondo
  const background = this.add.image(0, 0, "background").setOrigin(0, 0);
  
  // Crear grupo estático para las carreteras
  const roads = this.physics.add.staticGroup();
  
  // Crear grupo estático para las columnas superiores
  const topColumns = this.physics.add.staticGroup({
    key: "column",
    repeat: 1,
    setXY: { x: 200, y: 0, stepX: 300 },
  });

  // Crear grupo estático para las columnas inferiores
  const bottomColumns = this.physics.add.staticGroup({
    key: "column",
    repeat: 1,
    setXY: { x: 350, y: 400, stepX: 300 },
  });

  // Crear la carretera y ajustarla
  const road = roads.create(400, 568, "road").setScale(2).refreshBody();

  // Crear el sprite del pájaro, ajustarle el rebote y que colisione con los límites del mundo
  bird = this.physics.add.sprite(0, 50, "bird").setScale(2);
  bird.setBounce(0.2);
  bird.setCollideWorldBounds(true);

  // Añadir colisión entre el pájaro y la carretera
  this.physics.add.overlap(bird, road, () => (hasLanded = true), null, this);
  this.physics.add.collider(bird, road);
  cursors = this.input.keyboard.createCursorKeys();  // Crear las teclas de cursor

  // Añadir colisión entre el pájaro y las columnas
  this.physics.add.overlap(bird, topColumns, () => hasBumped = true, null, this);
  this.physics.add.overlap(bird, bottomColumns, () => hasBumped = true, null, this);
  this.physics.add.collider(bird, topColumns);
  this.physics.add.collider(bird, bottomColumns);

  // Crear el mensaje inicial para el jugador
  messageToPlayer = this.add.text(0, 0, `Instructions: Press space bar to start`, { fontFamily: '"Comic Sans MS", Times, serif', fontSize: "20px", color: "white", backgroundColor: "black" });
  Phaser.Display.Align.In.BottomCenter(messageToPlayer, background, 0, 50);
}

function update() {
  // Si la tecla de cursor hacia arriba está presionada y el pájaro no ha aterrizado o chocado, elevar el pájaro
  if (cursors.up.isDown && !hasLanded && !hasBumped) {
      bird.setVelocityY(-160);
  }
    
  // Si el juego no ha comenzado, mantener el pájaro en el aire
  if (!isGameStarted) {
      bird.setVelocityY(-160);
  }

  // Si el pájaro no ha aterrizado ni chocado, moverlo hacia la derecha
  if (!hasLanded || !hasBumped) {
      bird.body.velocity.x = 50;
  }
    
  // Si el pájaro ha aterrizado o chocado, detenerlo
  if (hasLanded || hasBumped || !isGameStarted) {
      bird.body.velocity.x = 0;
  }

  // Si se presiona la barra espaciadora y el juego no ha comenzado, iniciar el juego
  if (cursors.space.isDown && !isGameStarted) {
      isGameStarted = true;
      messageToPlayer.text = 'Instructions: Press the "^" button to stay upright\nAnd don\'t hit the columns or ground';
  }

  // Si el pájaro ha aterrizado o chocado, mostrar el mensaje de choque
  if (hasLanded || hasBumped) {
      messageToPlayer.text = `Oh no! You crashed!`;
  }

  // Si el pájaro llega al final de la pantalla, mostrar el mensaje de victoria
  if (bird.x > 750) {
      bird.setVelocityY(40);
      messageToPlayer.text = `Congrats! You won!`;
  }
}
