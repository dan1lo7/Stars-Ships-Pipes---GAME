// Seleção dos elementos do DOM
const bird = document.getElementById("bird");
const gameContainer = document.getElementById("gameContainer");
const scoreDisplay = document.getElementById("score");
const screenGameOver = document.getElementById("screenGameOver");

// Constantes de configuração
const GRAVITY = 3.1;
const GRAVITY_INTERVAL_TIME = 10;
const JUMP_HEIGHT = 11;
const MICRO_JUMPS_NUMBER = 10;
const JUMP_INTERVAL_TIME = 10;

// Constantes dos tubos
const PIPE_WIDTH = 60;
const PIPE_GAP = 180;
const PIPES_VELOCITY = 7;
let PIPE_INTERVAL = 2000;
let score = 0;

// Estado do pássaro
let birdInitialTopPosition =
  bird.getBoundingClientRect().top - gameContainer.getBoundingClientRect().top;
let birdRelativeTopPosition = birdInitialTopPosition;
let isJumping = false;
let jumpCount = 0;
let isDead = false;

// Variáveis dos tubos
let pipes = [];
let pipesInterval = null;
let pipeCreationInterval = null;
let fallInterval = null;
let refreshEnabled = false;

// Evento de teclado para o salto e reinício
document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    if (isDead && refreshEnabled) {
      // Apenas reinicia se não estiver em animação de queda
      // if (
      //   birdRelativeTopPosition >=
      //   gameContainer.clientHeight - bird.offsetHeight
      // ) {
      restartGame();
      // }
    } else {
      jump();
    }
  }
});

// Função para atualizar a pontuação
function updateScore() {
  score++;
  scoreDisplay.innerText = score;
}

// Atualiza a posição do pássaro no DOM
function updateBirdPosition() {
  bird.style.top = `${birdRelativeTopPosition}px`;
}

// Verifica colisões (com o chão e o teto)
function checkCollision() {
  const containerHeight = gameContainer.clientHeight;
  const birdHeight = bird.offsetHeight;

  // Colisão com o chão
  if (birdRelativeTopPosition + birdHeight >= containerHeight) {
    birdRelativeTopPosition = containerHeight - birdHeight;
    gameOver();
  }

  // Colisão com o teto
  if (birdRelativeTopPosition <= 0) {
    birdRelativeTopPosition = 0;
  }
}

// Finaliza o jogo
function gameOver() {
  clearInterval(pipesInterval);
  clearInterval(pipeCreationInterval);
  clearInterval(fallInterval);

  isDead = true;

  screenGameOver.style.display = "block";
  gameContainer.style.backgroundImage = "url('../img/Bbmn_1-0001.jpg')";

  bird.className = "birdExplosion";

  setTimeout(() => {
    bird.className = "displayNone";
    refreshEnabled = true;
  }, 800);
}

// Faz o pássaro cair
function fall() {
  birdRelativeTopPosition += GRAVITY;
  checkCollision();
  updateBirdPosition();
}

// Faz o pássaro saltar
function jump() {
  if (isJumping || isDead) return;

  isJumping = true;
  jumpCount = 0;

  const jumpInterval = setInterval(() => {
    if (jumpCount < MICRO_JUMPS_NUMBER) {
      birdRelativeTopPosition -= JUMP_HEIGHT;
      updateBirdPosition();
      jumpCount++;
    } else {
      clearInterval(jumpInterval);
      isJumping = false;
    }
  }, JUMP_INTERVAL_TIME);
}

// Função para criar tubos
function createPipe() {
  let pipeSkyHeight = Math.random() * (gameContainer.clientHeight - PIPE_GAP);

  if (pipeSkyHeight < 50) {
    pipeSkyHeight = 50;
  } else if (pipeSkyHeight > 370) {
    pipeSkyHeight = 370;
  }

  const pipeFloorHeight = gameContainer.clientHeight - pipeSkyHeight - PIPE_GAP;

  const pipeSky = createPipeElement(pipeSkyHeight, 0, "top");
  pipes.push(pipeSky);
  gameContainer.appendChild(pipeSky);

  const pipeFloor = createPipeElement(pipeFloorHeight, 0, "bottom");
  pipes.push(pipeFloor);
  gameContainer.appendChild(pipeFloor);
}

// Função auxiliar para criar um tubo
function createPipeElement(height, position, positionProp) {
  const pipe = document.createElement("div");

  if (positionProp == "top") {
    pipe.className = "pipeTop";
  } else {
    pipe.className = "pipeBottom";
  }

  pipe.style.height = `${height}px`;
  pipe.style.width = `${PIPE_WIDTH}px`;
  pipe.style.left = `${gameContainer.clientWidth}px`;
  pipe.style[positionProp] = position;
  return pipe;
}

// Move os tubos e verifica colisões com o pássaro
function movePipes() {
  pipes.forEach((pipe, index) => {
    const leftPosition = parseInt(pipe.style.left);
    pipe.style.left = `${leftPosition - PIPES_VELOCITY}px`;

    if (checkCollisionWithPipe(pipe)) {
      gameOver();
    }

    if (leftPosition < -PIPE_WIDTH) {
      pipe.remove();
      pipes.splice(index, 1);

      if (pipe.style.top === "0px") {
        updateScore();
      }
    }
  });
}

// Verifica colisão com um tubo
function checkCollisionWithPipe(pipe) {
  const pipeRect = pipe.getBoundingClientRect();
  const birdRect = bird.getBoundingClientRect();

  return (
    birdRect.right > pipeRect.left &&
    birdRect.left < pipeRect.right &&
    birdRect.bottom > pipeRect.top &&
    birdRect.top < pipeRect.bottom
  );
}

// Gera novos tubos em intervalos regulares
function startCreatingPipes() {
  pipeCreationInterval = setInterval(createPipe, PIPE_INTERVAL);
}

// Move os tubos constantemente
function startMovingPipes() {
  pipesInterval = setInterval(movePipes, GRAVITY_INTERVAL_TIME);
}

// Faz o pássaro cair constantemente
function startFalling() {
  fallInterval = setInterval(fall, GRAVITY_INTERVAL_TIME);
}

// Função para reiniciar o jogo
function restartGame() {
  refreshEnabled = false;
  birdRelativeTopPosition = birdInitialTopPosition; // Posição inicial
  isDead = false;
  isJumping = false;

  bird.className = "bird";
  score = 0;
  scoreDisplay.innerText = score;
  screenGameOver.style.display = "none";

  pipes.forEach((pipe) => pipe.remove());
  pipes = [];

  gameContainer.style.backgroundImage = "url('../img/Bbmn_1.gif')";

  // Reiniciar os intervalos e a posição do pássaro
  updateBirdPosition(); // Atualiza a posição do pássaro no DOM
  startCreatingPipes();
  startMovingPipes();
  startFalling(); // Reinicia a queda do pássaro
}

// Iniciar o jogo a primeira vez
startCreatingPipes();
startMovingPipes();
startFalling();
