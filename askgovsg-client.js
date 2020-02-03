const ASKGOVSG_ENDPOINT = 'https://askgov.isomerpages.com/'

const currScript = document.getElementById('askgov')
const colorScheme = currScript.dataset.colors
const botName = currScript.dataset.name

// Insert botswanna css
let botswannaStyles = document.createElement("link")
botswannaStyles.href = "https://answerbot.s3-ap-southeast-1.amazonaws.com/botswanna/style.css"
botswannaStyles.setAttribute('rel', 'stylesheet')
botswannaStyles.setAttribute('type', 'text/css')

// Insert custom css
let botswannaCustomColors = document.createElement("style")
botswannaCustomColors.innerHTML = colorScheme

// Insert Vue scripts
let vueScript = document.createElement("script")
vueScript.src = "https://cdn.jsdelivr.net/npm/vue/dist/vue.js"
let vuexScript = document.createElement("script")
vuexScript.src = "https://unpkg.com/vuex"
let domPurifyScript = document.createElement("script")
domPurifyScript.src = "https://answerbot.s3-ap-southeast-1.amazonaws.com/botswanna/dompurify.min.js"

document.head.append(botswannaStyles, botswannaCustomColors, vueScript, vuexScript, domPurifyScript)

// Load botswanna script after div is created
let botswannaDiv = document.createElement("div")
let botswannaScript = document.createElement("script")

// Insert botswanna container after Vue is loaded
vueScript.onload = () => {
  botswannaDiv.id = "botswanna"
  document.body.append(botswannaDiv)

  // Load botswanna script
  botswannaScript.src = "https://answerbot.s3-ap-southeast-1.amazonaws.com/botswanna/botswanna.js"
  document.head.append(botswannaScript)
}

botswannaScript.onload = () => {
  const botswanna = new Botswanna({
    propsData: {
      initBubbles: [
        { 
          type: 'text',
          data: {
            content: 'Hi, how can I help you?',
            bot: true, 
          }
        }
      ],
      initName: botName,
    }
  }).$mount('#botswanna')
  
  botswanna.listen(async ({ value, trigger }) => {
    const sanitizedQuery = DOMPurify.sanitize(value)
    const fetchConfig = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        'Referrer': window.location.origin
      },
      referrerPolicy: 'origin',
      body: JSON.stringify({query: sanitizedQuery})
    }
    let resp = await fetch(ASKGOVSG_ENDPOINT, fetchConfig)
    let { answer, suggestions } = await resp.json()

    const sanitizedAnswer = DOMPurify.sanitize(answer)
    if (answer) {
      botswanna.sendMessage('text', { content: sanitizedAnswer, bot: true })
    }

    if (suggestions) {
      botswanna.sendMessage('buttons', {
        buttons: suggestions.suggestions.suggestions.map(suggestion => {
          const sanitizedTitle = DOMPurify.sanitize(suggestion.title)
          return { title: sanitizedTitle, value: sanitizedTitle }
        }),
      })
    }
  })
}
