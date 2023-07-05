# fast

> [When shooting is taking place, it will be under the control of a Field Captain who will indicate when it is safe to shoot, but every archer can play a part in this. If you see anything that gives a cause for concern, then call out “FAST” and all shooting will cease, even if an archer is at full draw they must let down the bow and wait.](http://bowmenofardleigh.com/shooting/glossary-of-archery-terms/#:~:text=SAFETY,on%20the%20bow.)

**Fast**, is a webapp that allows an archer to record their scores as they go through their ends, rounds and shoots. Calculates running totals, hits e.t.c. on the fly.

![Screenshot of the app](https://i.imgur.com/T5OlvVP.png)

https://winter-feather-5776.fly.dev

- It's a [PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps), so it can be installed on your phone and used offline
- It keeps all state in local storage, you don't need to worry about navigating away and losing your data
  - It has the capability to export and import the data, so you can move it between devices
- Allows you to record a history of your shoots to track your progression

## Tech choices

- [Vue](https://vuejs.org/) - A progressive, incrementally-adoptable JavaScript framework for building UI on the web.

Whilst I am a huge [HTMX](https://quii.dev/HTMX_is_the_Future) fan, for this I wanted a static website, so that I wouldn't have to pay for a database, and I can keep the hosting cheap. I also wanted to try out Vue, so this was a good opportunity to do so. 

It's been a lot of fun, the event system and reactivity is simple and I find it more intuitive than React. If I were to start a project where I knew I'd need something very client-side heavy, which wouldn't be appropriate for HTMX, I'd definitely consider Vue.