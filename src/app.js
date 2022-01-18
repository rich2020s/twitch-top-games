import '../normalize.css'
import '../style.css'
let offset = 0

topGames()

function topGames() {
  const gameName = document.querySelectorAll('.nav__links--games')
  const firstGame = document.querySelector('.content__title h2')
  return fetch('https://api.twitch.tv/kraken/games/top?limit=5', {
    headers: {
      'Accept': 'application/vnd.twitchtv.v5+json', 
      'Client-ID': '0tv1kk5m6dndqvi2vbywana4l5hpjs'
    }
  })
    .then((response) => {
      if (response.status >= 200 && response.status < 400) {
        return response.json()
      } else {
        throw new Error('Network response was not ok.')
      }
    })
    .then((response) => {
      for (let i = 0; i < 5; i++) {
        if (i === 0) firstGame.innerText = response.top[i].game.name
        gameName[i].innerText = response.top[i].game.name
      }
    return getLiveStreams(response.top[0].game.name)
    })
    .then((response) => {
      displayStream(response)
    })
    .catch((err) => {
      console.log('error: ', err)
    })
}

function getLiveStreams(game) {
  return fetch(`https://api.twitch.tv/kraken/streams/?game=${game}&limit=20&offset=${offset}`, {
    headers: {
      'Accept': 'application/vnd.twitchtv.v5+json', 
      'Client-ID': '0tv1kk5m6dndqvi2vbywana4l5hpjs'
    }
  })
    .then((response) => {
      if (response.status >= 200 && response.status < 400) {
        return response.json()
      } else {
        throw new Error('Network response was not ok.')
      }
    })
    .then((response) => {
      if (response.streams.length < 20) document.querySelector('.loadingBtn').remove()
      return response
    })
    .catch((err) => {
      console.log('error: ', err)
    })
}

function displayStream(streams) {
  for (let i = 0; i < streams.streams.length; i++) {
    const container = document.createElement('div')
    container.innerHTML = `
      <a href="${streams.streams[i].channel.url}" class="stream__link" target="_blank">
        <div class="stream__preview">
          <img src="${streams.streams[i].preview.medium}"></img>
        </div>
        <div class="stream__info">
          <span class="stream__logo" style="background: url(${streams.streams[i].channel.logo}) center/cover"></span>
          <div>
            <h3 class="stream__status">${streams.streams[i].channel.status}</h3>
            <div class="stream__name">${streams.streams[i].channel.name}</div>
          </div>  
        </div>
      </a>`
    container.classList.add('stream')
    document.querySelector('.streams').appendChild(container)
  }
}

const gamesBtn = document.querySelector('.nav__links')
gamesBtn.addEventListener('click', (e) => {
  const links = document.querySelector('.nav__links--games.active')
  links.classList.remove('active')
  e.target.classList.add('active')
  offset = 0
  getLiveStreams(e.target.innerText)
    .then((data) => {
      document.querySelector('.content__title h2').innerText = data.streams[0].game
      document.querySelector('.streams').innerHTML = ''
      displayStream(data)
    })
    .catch((err) => console.log(err))
})

const loadingBtn = document.createElement('button')
loadingBtn.classList.add('loadingBtn')
loadingBtn.innerText = 'see more'
document.querySelector('body').appendChild(loadingBtn)
loadingBtn.addEventListener('click', (e) => {
  offset += 20
  getLiveStreams(document.querySelector('.nav__links--games.active').innerText)
    .then((data) => {
      displayStream(data)
    })
})
