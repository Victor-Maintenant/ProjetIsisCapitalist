import { useEffect, useState } from 'react';
import { Services } from './Services';
import './App.css';
import { World, Product, Pallier } from './World';
import ProductComponent from './Product';
import { transform } from './utils';
import { Modal } from 'react-bootstrap';

function App() {
  const [services, setServices] = useState(new Services(""));
  const [world, setWorld] = useState(new World());
  const [username, setUsername] = useState("");
  let user = localStorage.getItem("username");
  const onUserNameChanged = (e: any) => {
    console.log("ok" + e.target.value)
    setUsername(e.target.value);
    localStorage.setItem("username", e.target.value);
  }

  useEffect(() => {
    if (username !== "") {
      let services = new Services(username)
      setServices(services)
      services.getWorld().then(response => {
        //let liste = compute_unlocks_list(response.data)
        console.log(response);
        setWorld(response.data);
        //setUnlockList(liste)
      })
    }
  }, [username])
  useEffect(() => {
    let username = localStorage.getItem("username");
    // si pas de username, on génère un username aléatoire
    if (!username || username === "") {
      username = "Îlien" + Math.floor(Math.random() * 10000);
    }
    localStorage.setItem("username", username);
    setUsername(username)
  }, [])
  console.log(world);
  
  
  function onProductionDone(p: Product): void {
    let gain = p.revenu;
    setWorld(world => ({
      ...world, score: world.score + gain,
        money: world.money + gain
    }))
    services.putProduct(p);
  }

  function onProductBuy(cost:number, product:Product):void{
    setWorld(world => ({...world, money:world.money - cost}));
    services.putProduct(product);
  }


  let [multiplicateur, setMulti] = useState(1);
  let [label, setLabel] = useState('Achetez par 1');
  let [count, setCount] = useState(0);

  function ButtonHandler() {
    if (count == 0) {
      setCount(count + 1);
      setLabel('Achetez par 10');
      setMulti(10);
    }
    else if (count == 1) {
      setCount(count + 1);
      setLabel('Achetez par 100');
      setMulti(100);
    }
    else if (count == 2) {
      setCount(count + 1);
      setLabel('Achetez le plus possible');
      setMulti(1000000);
    }
    else {
      setCount(0);
      setLabel('Achetez par 1');
      setMulti(1);
    }
  }

  const [showManagers, setShowM] = useState(false);
  const handleCloseM = () => setShowM(false);
  const handleShowM = () => setShowM(true);
  const [showUpgrades, setShowU] = useState(false);
  const handleCloseU = () => setShowU(false);
  const handleShowU = () => setShowU(true);
  const [showUnlocks, setShowUn] = useState(false);
  const handleCloseUn = () => setShowUn(false);
  const handleShowUn = () => setShowUn(true);
  const [showAngel, setShowA] = useState(false);
  const handleCloseA = () => setShowA(false);
  const handleShowA = () => setShowA(true);

  function hire(m: Pallier) {
    m.unlocked = true;
    world.products.product.filter(p => p.id == m.idcible).map(prod => prod.managerUnlocked = true);
    setWorld(world => ({
      ...world, money: world.money + m.seuil
    }))
    services.putManager(m);
  }

  function buyUpgrade(u: Pallier) {
      u.unlocked = true;
      world.products.product.filter(p => p.id == u.idcible).map(prod => {
        if (u.typeratio == "VITESSE"){
          prod.vitesse = prod.vitesse / u.ratio;
          prod.progressbarvalue = prod.progressbarvalue / u.ratio;
          prod.timeleft = prod.timeleft / u.ratio;
          u.ratio = 1;
        }
        else if (u.typeratio == "GAIN"){
            prod.revenu = prod.revenu * u.ratio;
            console.log("REVENU de " + prod.name + " multiplié par " + u.ratio);
            u.ratio = 1;
        }}
      );
      setWorld(world => ({
        ...world, money: world.money + u.seuil
      }))
      services.putUpgrade(u);
  }

  function buyAngel(a: Pallier) {
    
  } 

  function checkAllUnlocks(seuil: number){
    let unlocked = true;
    world.products.product.map(produit => 
        produit.palliers.pallier.map(echelon => 
            {
                if(echelon.seuil == seuil){
                    if(!echelon.unlocked){
                        unlocked = false;
                    }
                }
            }
        )
    )
    if(unlocked){
        let allunlock = world.allunlocks.pallier.find(allunlock => allunlock.seuil == seuil);
        if(allunlock != null){
            freeAllUnlock(allunlock);
        }
    }
}

function freeAllUnlock(allunlock: Pallier){
    allunlock.unlocked = true;
    world.products.product.map(prod =>
        {    
            if (allunlock.typeratio=="VITESSE"){
                
                prod.vitesse = prod.vitesse / allunlock.ratio
                prod.progressbarvalue = prod.progressbarvalue / allunlock.ratio
                prod.timeleft = prod.timeleft / 2
                //setProgress(prod.progressbarvalue)
                console.log("VITESSE de " + prod.name + " divisé par " + allunlock.ratio)
            }
            else if (allunlock.typeratio == "GAIN"){
                prod.revenu = prod.revenu * allunlock.ratio
                console.log("REVENU de " + prod.name + " multiplié par " + allunlock.ratio)
            }
        }
    )
}


  return (
    <div className="App">

      <div className="App-header">
        <div> <img src={services.server + world.logo} /> <span>{world.name}</span></div>
        <div> <span dangerouslySetInnerHTML={{ __html: transform(world.money) }} /> </div>
        <div className='multi'> <button onClick={ButtonHandler}>{label}</button> </div>
        <div> <label> Choisis ton pseudo :
          <input type="text" value={username} onChange={onUserNameChanged} id="inputUsername" /></label> </div>
      </div>

      <div className='App-Body'>
        <div className="main">

          <div className="menu">
            <button onClick={handleShowUn}>Unlocks</button>
            <button onClick={handleShowU}>Cash Upgrades</button>
            <button onClick={handleShowA}>Angel Upgrades</button>
            <button onClick={handleShowM}>Managers</button>
            <button>Investors</button>
          </div>

          <div className='products'>
            {world.products.product.map((p) =>
              <div key={p.name}>
                <ProductComponent prod={p} onProductionDone={onProductionDone} services={services} qtmulti={multiplicateur} world={world} checkAllUnlocks = {checkAllUnlocks} onProductBuy={onProductBuy}/>
              </div>
            )}
          </div>

        </div>
      </div>

      <div className='pageManagers'>
        <Modal show={showManagers} className="modal">
          <div>
            <h1 className="title">Managers make you feel better !</h1>
          </div>
          <div>
            <div className="managers">
              {world.managers.pallier.filter(manager => !manager.unlocked).map(
                manager => (
                  <div key={manager.idcible} className="managergrid">
                    <div className="composantGrid" id="managerLogo">
                      <img alt="manager logo" className="imgManagerLogo" src={services.server + manager.logo} />
                    </div>
                    <div className="composantGrid" id="infosManagers">
                      <div> {manager.name} </div>
                      <div> {world.products.product[manager.idcible - 1].name}</div>
                      <div className="composantGrid" id="managerSeuil"> {manager.seuil} </div>
                    </div>
                    <div className="divBoutonEngager">
                      <button className="boutonEngager" onClick={() => hire(manager)} disabled={world.money < manager.seuil}>Engager !</button>
                    </div>
                  </div>
                ))}
            </div>
            <button className="boutonFermer" onClick={() => handleCloseM()}>Close</button>
          </div>
        </Modal>
      </div>
      <div className='pageUpgrades'>
        <Modal show={showUpgrades} className="modal">
          <div>
            <h1 className="title">Upgrades made you happy !</h1>
          </div>
          <div>
            <div className="upgrades">
              {world.upgrades.pallier.filter(upgrade => !upgrade.unlocked).map(
                upgrade => (
                  <div key={upgrade.idcible} className="upgradegrid">
                    <div className="composantGrid" id="upgradeLogo">
                      <img alt="upgrade logo" className="imgUpLogo" src={services.server + upgrade.logo} />
                    </div>
                    <div className="composantGrid" id="infosUpgrade">
                      <div> {upgrade.name} </div>
                      <div className="composantGrid" id="upgradeSeuil"> {upgrade.seuil} €</div>
                    </div>
                    <div className="divBoutonAcheterU">
                      <button className="boutonEngager" onClick={() => buyUpgrade(upgrade)} disabled={world.money < upgrade.seuil}>Acheter !</button>
                    </div>
                  </div>
                ))}
            </div>
            <button className="boutonFermer" onClick={() => handleCloseU()}>Close</button>
          </div>
        </Modal>
      </div>
      <div className='pageUnlocks'>
        <Modal show={showUnlocks} className="modal">
        <button className="boutonFermer" onClick={() => handleCloseUn()}>Close</button>
          <div>
            <h1 className="title">Buy more to have more!</h1>
          </div>
          <div>
            <div className="unlocks">
              {world.products.product.filter(p => p.quantite !=0).map(
                  product => product.palliers.pallier.filter(u => !u.unlocked).map(
                    unlock =>
                    <div key={unlock.idcible} className="unlockgrid">
                      <div className="composantGrid" id="unlockLogo">
                        <img alt="upgrade logo" className="imgUnLogo" src={services.server + unlock.logo} />
                      </div>
                      <div className="composantGrid" id="infosUnlock">
                        <div> {unlock.name} </div>
                        <div className="composantGrid" id="unlockSeuil"> {unlock.seuil} </div>
                        <div><span>{product.name} {unlock.typeratio} x{unlock.ratio}</span></div>
                      </div>
                    </div>
                ))}
                {world.allunlocks.pallier.filter(upgrade => !upgrade.unlocked).map(
                upgrade => (
                  <div key={upgrade.idcible} className="unlockgrid">
                    <div className="composantGrid" id="unlockLogo">
                      <img alt="upgrade logo" className="imgUpLogo" src={services.server + upgrade.logo} />
                    </div>
                    <div className="composantGrid" id="infosUpgrade">
                      <div> {upgrade.name} </div>
                      <div className="composantGrid" id="upgradeSeuil"> {upgrade.seuil} </div>
                      <div><span>{upgrade.name} {upgrade.typeratio} x{upgrade.ratio}</span></div>
                    </div>
                  </div>
                ))}
            </div>
            
          </div>
        </Modal>
      </div>

      <div className='pageAngel'>
        <Modal show={showAngel} className="modal">
          <div>
            <h1 className="title">Oh God an Angel !</h1>
          </div>
          <div>
            <div className="unlocks">
              {world.angelupgrades.pallier.filter(a=> !a.unlocked).map(
                a=>
                    <div key={a.idcible} className="angelgrid">
                      <div className="composantGrid" id="angelLogo">
                        <img alt="angel logo" className="imgUnLogo" src={services.server + a.logo} />
                      </div>
                      <div className="composantGrid" id="infosUpgrade">
                        <div> {a.name} </div>
                        <div className="composantGrid" id="upgradeSeuil"> {a.seuil} anges</div>
                      </div>
                    <div className="divBoutonAcheterA">
                      <button className="boutonAcheter" onClick={() => buyAngel(a)} disabled={world.money < a.seuil}>Acheter !</button>
                    </div>
                    </div>
              )}
            </div>
            <button className="boutonFermer" onClick={() => handleCloseA()}>Close</button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
export default App;