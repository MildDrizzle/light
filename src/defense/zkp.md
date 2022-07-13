### Overview

In this post, we aim to familiarize the reader with some tools to implement Zk-SNARKs on ethereum. Recently, a lot has been written on zero knowledge proofs, however even then the math behind zero knowledge proofs remains to be “cryptic” and hard to grasp. For an uninitiated reader, Introduction to zk-SNARKs and Quadratic Arithmetic Programs serve as excellent resources to start reading about Zk-SNARKs and this post will help the reader put them to practice while treating the math behind as a black box.

**What does a general-purpose succinct ZKP do?**

Suppose that you have a (public) `function C()`, a (private) input `x` and a (public) output `y`. You want to prove that you know an `x` such that `C(x) = y`, without revealing what `x` is. Furthermore, for the proof to be succinct, you want it to be verifiable much more quickly than computing `C()` itself.

A Zk-SNARKs computation needs to be initialized by a trusted party. This involves modifying the computation `C` into a circuit format and using a secret parameter _lambda_ to generate the proving and verifying keys that are used later. Following this, _lambda_ - also called the "waste" needs to be destroyed - otherwise it will enable an adversary to generate fake proofs of the knowledge. For this reason, the Zcash team - a fork of bitcoin that’s based on zK-SNARKs and lets one perform _shielded_ transactions conducted an elaborate ceremony to generate these keys. Zcash has optional _shielded_ transactions that let you transfer hidden amounts to hidden addresses.

Now, when a prover wishes to prove to they know an answer to the computation `C()`, they will generate a proof using the proving key, public inputs `x` and secret input `w`. When the verifier wants to verify that answer to the computation is indeed correct, they would verify the proof using the verifier key, public inputs `x` and proof.

There is a whole class of cryptographic/security systems which rely on what are called _"trapdoor functions"_. The idea is that they are functions which are generally easy to compute, but for which finding the inverse is very hard. One such example is the function that takes two integers and multiplies them together (something we can do very easily), versus the "inverse", which is a function that takes an integer and gives you proper factors (given `n`, two numbers `p` and `q` such that `pq=n` and `1 < p,q < n` ). Infact RSA derives its security from this trapdoor; difficulty of factoring integers that are the product of two large prime numbers. Multiplying these two numbers is easy, but determining the original prime factors is considered infeasible. Let's say you were able to break a large number being used in the RSA key and you want to prove that you possess knowledge of the factors of the key - without divulging the factors themselves. We will write code enable a participant to do so.

First let us set up ZoKrates on our local machine and run it as a docker container

```zsh
git clone https://github.com/JacobEberhardt/ZoKrates 
cd ZoKrates 
docker build -t zokrates . 
docker run --name zokrates -ti zokrates /bin/bash 
```

Now, initialize a truffle project 

```zsh
mkdir zksnark && cd zksnark 
truffle init 
```

Now, we will write the computation function that a prover needs to prove (and the one that the verifier will verify) in the file `computation.code`. 

```zsh
def main(field c, private field a, private field b) -> (field): 
  field d = a * b 
  c == d 
  return 1 
```  

Here, c (public input) is the large number and a, b (private inputs) are its factors. The statement `c == d` is an assertion that in fact c is the product of the supplied numbers a, b. If the assertion passes, we return 1. Now, we will walk you through using zokrates to generate the proof of our knowledge.

Copy the file `computation.code` to the zokrates container 

```zsh
docker cp computation.code zokrates:/home/zokrates/ 
```

We will now compile `computation.code`. zokrates compile takes a file written in the ZoKrates higher level language and compiles it into an arithmetic circuit. This step is called “flattening” procedure, where we convert the original code, into a sequence of statements that are of two forms: `x = y` (where y can be a variable or a number) and `x = y (op) z` (where op can be +, -, *, / and y and z can be variables, numbers or themselves sub-expressions). You can think of each of these statements as being kind of like logic gates in a circuit. 

Go to the zokrates container

```zsh
./zokrates compile -i computation.code 
```


The arithmetic circuit can be viewed: `cat out.code`. Because we have chosen a simple example for the computation, the circuit looks very similar to the input program. 


```zsh
def main(_2,private _3,private _4): 
  _5 = (_3 * _4) 
  _2 == _5 
  return 1 
```

Now, we generate the proving and verification keys for the computation C. `zokrates setup` uses a generator function to generates these keys from the arithmetic circuit and "toxic-waste" parameter lambda `(pk, vk) = G(λ, C)`.


```zsh
./zokrates setup
```

You can check that 2 new files, `proving.key` and `verification.key` have been generated. The proving key can be made public for anyone to be able to generate proofs of the knowledge. Next, we will generate a verifier contract that will be deployed on the ethereum blockchain. Luckily, zokrates provides this functionality out of the box. 

```zsh
./zokrates export-verifier 
```

Using the verifying key at `./verifying.key`, it generates a Solidity contract which contains the generated verification key and a public function `verifyTx` to verify a solution to the compiled program. 

Now, suppose we want to prove that we know the primes factors of the number `3512941527679`. `524287 * 6700417 = 3512941527679`. For that `3512941527679` becomes our public input and its factors `524287`, `6700417` are our private inputs - we don't really want to tell what these numbers are but still prove we know them! We use the zokrates compute-witness command for the same. 


```zsh
./zokrates compute-witness --interactive -a 3512941527679 
```

```
<enter private inputs interactively> 

Please enter a value for FlatVariable(id: 2): 

524287 

Please enter a value for FlatVariable(id: 3): 

6700417 

Computing witness...
```

You can check that the proof has been generated and written to file `proof.json`. Moreover you can verify that if you enter incorrect private inputs (numbers whose product is not the given number), the proof computation will fail with error `Error { message: "Condition not satisfied: _2 should equal _5" }.`

Well, it's time to move to the blockchain world now! We will deploy the verifier contract generated above and try passing our proof to the verifyTx function to see what happens - Will our knowledge be proven? The next step is to copy the contract and proof from the zokrates container to our truffle project directory. 

```zsh
docker cp zokrates:/home/zokrates/proof.json . 
docker cp zokrates:/home/zokrates/verifier.sol contracts/. 
```

[This](https://github.com/decentral-inc/zksnarks-example) is the reference repository for the code here. You can have a look at the verifier solidity code generated by the zokrates compiler [here](https://github.com/decentral-inc/zksnarks-example/blob/master/contracts/verifier.sol). Now we will compile this and code and deploy it to the the `ganache-cli` instance running locally. 

```zsh
truffle compile
truffle migrate
```

We have written a test [verifierTest.js](https://github.com/decentral-inc/zksnarks-example/blob/master/test/verifierTest.js) that reads the proof from proof.json and invokes the verifyTx function in the verifier contract. Following that we assert that indeed our proof was (in)correct. 

 ```zsh
 truffle test
 ```
 
 

Zero knowledge proofs open a whole new class of possibilities for creating ZK-Apps. The team working on the Pairing product launch is leveraging Zk proofs to create a proof of trust protocol to create a distributed trust for data input to smart contracts. 
