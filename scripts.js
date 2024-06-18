document.addEventListener("DOMContentLoaded", function() {
  const capitaisJSON = JSON.parse(document.getElementById("capitais-json").textContent);

  const originSelect = document.getElementById("origin");
  const destinationSelect = document.getElementById("destination");

  capitaisJSON.forEach(city => {
      const capital = Object.keys(city)[0];
      let option = document.createElement("option");
      option.value = capital;
      option.textContent = capital;
      originSelect.appendChild(option);

      let optionClone = option.cloneNode(true);
      destinationSelect.appendChild(optionClone);
  });
});

function findCheapestPath() {
  const origin = document.getElementById("origin").value;
  const destination = document.getElementById("destination").value;
  const fuelPrice = parseFloat(document.getElementById("fuelPrice").value);
  const fuelEfficiency = parseFloat(document.getElementById("fuelEfficiency").value);

  if (!origin || !destination || !fuelPrice || !fuelEfficiency) {
      alert("Por favor, preencha todos os campos.");
      return;
  }

  const capitaisJSON = JSON.parse(document.getElementById("capitais-json").textContent);
  const graph = buildGraph(capitaisJSON);
  const result = dijkstra(graph, origin, destination, fuelPrice, fuelEfficiency);
  displayResult(result);
}

function buildGraph(data) {
  const graph = {};

  data.forEach(city => {
      const capital = Object.keys(city)[0];
      const info = city[capital];
      graph[capital] = {
          toll: info.toll,
          neighbors: info.neighbors
      };
  });

  return graph;
}

function dijkstra(graph, start, end, fuelPrice, fuelEfficiency) {
  const costs = {};
  const backtrace = {};
  const pq = new PriorityQueue();

  costs[start] = 0;

  Object.keys(graph).forEach(capital => {
      if (capital !== start) {
          costs[capital] = Infinity;
      }
  });

  pq.enqueue([start, 0]);

  while (!pq.isEmpty()) {
      let [currentNode, currentCost] = pq.dequeue();

      Object.keys(graph[currentNode].neighbors).forEach(neighbor => {
          const distance = graph[currentNode].neighbors[neighbor];
          const toll = graph[neighbor].toll;
          const cost = currentCost + calculateCost(distance, fuelPrice, fuelEfficiency, toll);
          if (cost < costs[neighbor]) {
              costs[neighbor] = cost;
              backtrace[neighbor] = currentNode;
              pq.enqueue([neighbor, cost]);
          }
      });
  }

  let path = [end];
  let lastStep = end;

  while (lastStep !== start) {
      path.unshift(backtrace[lastStep]);
      lastStep = backtrace[lastStep];
  }

  return {
      path: path,
      cost: costs[end]
  };
}

function calculateCost(distance, fuelPrice, fuelEfficiency, toll) {
  const fuelCost = (distance / fuelEfficiency) * fuelPrice;
  return fuelCost + toll;
}

function displayResult(result) {
  const resultDiv = document.getElementById("result");
  if (result.path.length === 1) {
      resultDiv.innerHTML = "Rota inexistente.";
  } else {
      resultDiv.innerHTML = `Caminho: ${result.path.join(" -> ")}<br>Custo Total: R$ ${result.cost.toFixed(2)}`;
  }
}

class PriorityQueue {
  constructor() {
      this.collection = [];
  }

  enqueue(element) {
      if (this.isEmpty()) {
          this.collection.push(element);
      } else {
          let added = false;
          for (let i = 1; i <= this.collection.length; i++) {
              if (element[1] < this.collection[i - 1][1]) {
                  this.collection.splice(i - 1, 0, element);
                  added = true;
                  break;
              }
          }
          if (!added) {
              this.collection.push(element);
          }
      }
  }

  dequeue() {
      return this.collection.shift();
  }

  isEmpty() {
      return (this.collection.length === 0);
  }
}
