const upBtn = document.querySelector('.buttons__up')
const rightBtn = document.querySelector('.buttons__right')
const leftBtn = document.querySelector('.buttons__left')
const downBtn = document.querySelector('.buttons__down')
const attackBtn = document.querySelector('.buttons__attack')
const restBtn = document.querySelector('.buttons__rest')
const gatherBtn = document.querySelector('.buttons__gather')
const gatherBtnLoop = document.querySelector('.buttons__gather--loop')

const characterName = document.querySelector('.console__name')
const characterHP = document.querySelector('.console__hp')
const yPosEl = document.querySelector('.console__y--position')
const xPosEl = document.querySelector('.console__x--position')
const coolDownEl = document.querySelector('.console__cooldown')
const automateEl = document.querySelector('#automate')

attackBtn.addEventListener('click', fight)
restBtn.addEventListener('click', rest)
gatherBtn.addEventListener('click', gathering)
gatherBtnLoop.addEventListener('click', gatherLooping)

let isRequesting = false;
let coolDownInterval = null
let currentPosX = 0
let currentPosY = 0
let coolDownTimer = 0
let currentHP = 0
let isLooping = false

upBtn.addEventListener('click', () => {
  move(currentPosX,(currentPosY - 1))
})

rightBtn.addEventListener('click', () => {
  move((currentPosX + 1), currentPosY)
})

leftBtn.addEventListener('click', () => {
  move((currentPosX - 1), currentPosY)
})

downBtn.addEventListener('click', () => {
  move(currentPosX,(currentPosY + 1))
})


const server = "https://api.artifactsmmo.com";
const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InN1cGVybHVja2UxMjNAZ21haWwuY29tIiwicGFzc3dvcmRfY2hhbmdlZCI6IiJ9.ABSXqufIfurQayk-6iV-yM4c1dJPWbPpS3cR9wbhehM";
const character = "w0z";
  
async function myCharacter() {
      
  const url = server + '/characters/' + character 
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'Bearer ' + token
    },
    
  };
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    console.log(data);

    currentPosX = data.data.x
    currentPosY = data.data.y

    characterName.innerText = 'Name:' + ' ' + data.data.name
    characterHP.innerText = 'HP:' + ' ' + data.data.hp
    xPosEl.innerText = 'X:' + ' ' + data.data.x
    yPosEl.innerText = 'Y:' + ' ' + data.data.y

    console.log('Information obtained')
  } catch (error) {
    console.log(error);
  }
  }
  
myCharacter();

async function move(moveX, moveY) {
      
    const url = server + '/my/' + character + '/action/move'
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify({ x: moveX, y: moveY })
    }
    try {
        const response = await fetch(url, options)
        const data = await response.json()

        console.log(data)

        currentPosX = data.data.destination.x
        currentPosY = data.data.destination.y
        coolDownTimer = data.data.cooldown.remaining_seconds

        coolDownEl.innerText = 'Cooldown:' + ' ' + data.data.cooldown.remaining_seconds
        xPosEl.innerText = 'X:' + ' ' + data.data.character.x
        yPosEl.innerText = 'Y:' + ' ' + data.data.character.y

        if (coolDownTimer > 0) {
          coolDown()
        }

} catch (error) {
    console.log(error)
}
}



async function fight() {
    const url = server + '/my/' + character + '/action/fight'
    let data = null

    const options = {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + token
        },
    }

    try {
        const response = await fetch (url, options)
        if (!response.ok) {
          console.error('API Error:')
          return
        }

        data = await response.json()
        console.log('Fight respone', data)

        if (!data.data || !data.data.cooldown || !data.data.character) {
          console.error('Ogiltrilig')
          return
        }

        coolDownTimer = data.data.cooldown.remaining_seconds
        currentHP = data.data.character.hp
        characterHP.innerText = 'HP:' + ' ' + data.data.character.hp
        coolDownEl.innerText = 'Cooldown:' + ' ' + data.data.cooldown.remaining_seconds

        if (coolDownTimer > 0) {
          coolDown()
        }
  
if(automateEl.checked && data.data.fight && data.data.fight.result === 'win') {

  if(currentHP < 70) {
      console.log('Low hp, resting...')
      setTimeout(() => rest(fight), (coolDownTimer + 3) * 1000)
  }
  else {
      console.log("HP Status ok, keeping up the fight!")
      setTimeout(fight, (coolDownTimer + 3) * 1000 )
  }
}
else if(data.data.fight && data.data.fight.result === 'loss') {
  console.log("loss!!!!")
  automateEl.checked = false
}

} catch(error) {
  console.error('Ett fel inträffade', error)
}
}

async function rest(callback) {
  const url = server + '/my/' + character + '/action/rest';

  const options = {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: 'Bearer ' + token
      },
  };

  try {
      const response = await fetch(url, options);
      if (!response.ok) {
          console.error('API Error:', response.status, response.statusText);
          return;
      }

      const data = await response.json();
      console.log('Rest response:', data);

      if (!data.data || !data.data.cooldown || !data.data.character) {
          console.error('Ogiltigt svar från API');
          return;
      }
      
        coolDownTimer = data.data.cooldown.remaining_seconds
        currentHP = data.data.character.hp 
        characterHP.innerText = 'HP:' + ' ' + data.data.character.hp
        coolDownEl.innerText = 'Cooldown:' + ' ' + data.data.cooldown.remaining_seconds
        coolDown()

      if (coolDownTimer > 0) {
          console.log('Resting cooldown active, waiting...');
          setTimeout(() => {
              if (callback) callback(); 
          }, coolDownTimer * 1000);
      } else {
          if (callback) callback(); 
      }
  } catch (error) {
      console.error('Ett fel inträffade under vila:', error);
  }
}

async function gathering() {
  const url = server + '/my/' + character + '/action/gathering'

  const options = {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'Bearer ' + token
      },
  }

  try {
      const response = await fetch (url, options)
      const data = await response.json()

      console.log(data)

      coolDownTimer = data.data.cooldown.remaining_seconds
      currentHP = data.data.character.hp
      characterHP.innerText = 'HP:' + ' ' + data.data.character.hp
      coolDownEl.innerText = 'Cooldown:' + ' ' + data.data.cooldown.remaining_seconds

      if (coolDownTimer > 0) {
        coolDown()
      }

  }
  catch(error) {
      console.log(error)
  }
}



async function gatherLooping() {
    if (isRequesting) return; 

    isRequesting = true;
    const url = server + '/my/' + character + '/action/gathering';
    const options = {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'Bearer ' + token,
      },
  }


    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            console.error('API Error:', response.status, response.statusText);
            return;
        }

        const data = await response.json();
        console.log('Response:', data);

        if (data.data && data.data.cooldown && data.data.character) {
            coolDownTimer = data.data.cooldown.remaining_seconds;
            currentHP = data.data.character.hp;
            characterHP.innerText = 'HP: ' + currentHP;
            coolDownEl.innerText = 'Cooldown: ' + coolDownTimer;

            coolDown()

            if (coolDownTimer > 0) {
                setTimeout(() => {
                    if (isLooping) gatherLooping();
                }, Math.max(coolDownTimer, 1) * 1000);
            } else if (isLooping) {
                setTimeout(() => gatherLooping(), 1000);
            }
        }
    } catch (error) {
        console.error('Ett fel inträffade:', error);
    } finally {
        isRequesting = false; 
    }
}


document.querySelector('.buttons__gather--loop').addEventListener('click', () => {
  isLooping = !isLooping; 
  const loopButton = document.querySelector('.buttons__gather--loop');
  
  if (isLooping) {
      gatherLooping(); 
      loopButton.innerText = 'Stop Loop'; 
  } else {
      loopButton.innerText = 'Start Loop'; 
  }
});


function coolDown() {
  if (coolDownInterval) clearInterval(coolDownInterval); 

    coolDownInterval = setInterval(() => {
        if (coolDownTimer > 0) {
            coolDownTimer--;
            coolDownEl.innerText = 'Cooldown: ' + coolDownTimer;
        } else {
            clearInterval(coolDownInterval); 
        }
    }, 1000); 
}