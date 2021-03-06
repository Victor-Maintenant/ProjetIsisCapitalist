import axios, {AxiosError, AxiosPromise} from 'axios';
import { Pallier, Product, World } from './World'

export class Services {
    //server = 'http://localhost:8080/';
    server = 'https://isiscapitalist.kk.kurasawa.fr/';
    api = this.server + 'adventureisis/generic';
    user = "";
    constructor(user: string) {
        this.user = user
    }

    private static handleError(error: AxiosError): AxiosPromise<any> {
        console.error('An error occurred', error.toJSON);
        return Promise.reject(error.message || error);
    }

    private static setHeaders(user: string) {
        return {
            "X-User": user
        }
    }
    getWorld(): AxiosPromise<World> {
        return axios({
            method: 'get',
            url: this.api + '/world',
            headers: Services.setHeaders(this.user)
        }).catch(Services.handleError)
    }
       

    putProduct(product : Product): AxiosPromise<World> {
        return axios({
            method: 'put',
            url: this.api + '/product',
            data: product,
            headers: Services.setHeaders(this.user)
        }).catch(Services.handleError)
    }

    putManager(manager : Pallier): AxiosPromise<Response> {
        return axios({
            method: 'put',
            url: this.api + '/manager',
            data: manager,
            headers: Services.setHeaders(this.user)
        }).catch(Services.handleError)
    }

    putUpgrade(upgrade: Pallier): AxiosPromise<Response> {
        return axios({
            method: 'put',
            url: this.api + '/upgrade',
            data: upgrade,
            headers: Services.setHeaders(this.user)
        }).catch(Services.handleError)
    }

    putUnlockProduct(unlock : Pallier): AxiosPromise<World> {
        return axios({
            method: 'put',
            url: this.api + '/unlock',
            data: unlock,
            headers: Services.setHeaders(this.user)
        }).catch(Services.handleError)
    }

    putAngel(angel : Pallier): AxiosPromise<Response> {
        return axios({
            method: 'put',
            url: this.api + '/angels',
            data: angel,
            headers: Services.setHeaders(this.user)
        }).catch(Services.handleError)
    }
}   