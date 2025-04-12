import { OSMapVueAdapter } from '@/utils/map'

export default {
  install: (app) => new OSMapVueAdapter().install(app),
}
