import { bootstrapApplication } from '@angular/platform-browser'
import { createWhiteLabelApp } from 'white-label-angular/app'

const { root, config } = await createWhiteLabelApp({})
bootstrapApplication(root, config).catch((err) => console.error(err))
