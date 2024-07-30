import React, { createContext, useEffect, useState } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";

import tracking from "../Context/Tracking.json";

const ContractAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const ContractABI = tracking.abi;

const fetchContract = (signerOrProvider) =>
    new ethers.Contract(ContractAddress, ContractABI, signerOrProvider);

export const TrackingContext = createContext();

export const TrackingProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);

    const DappName = "Product Tracking Name";

    const createShipment = async (items) => {
        console.log(items);
        const { receiver, pickupTime, distance, price } = items;
        try {
            const web3Modal = new Web3Modal();
            const connection = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();
            const contract = fetchContract(signer);
            const createItem = await contract.createShipment(
                receiver,
                new Date(pickupTime).getTime(),
                distance,
                ethers.utils.parseUnits(price, 18),
                {
                    value: ethers.utils.parseUnits(price, 18),
                }
            );
            await createItem.wait();
            console.log(createItem);
        } catch (error) {
            console.log("Something went wrong", error);
        }
    };

    const getAllShipments = async () => {
        try {
            const provider = new ethers.providers.JsonRpcProvider();
            const contract = fetchContract(provider);
            const shipments = await contract.getAllShipments();
            const allShipments = shipments.map((shipment) => ({
                sender: shipment.sender,
                receiver: shipment.receiver,
                price: ethers.utils.formatEther(shipment.price.toString()),
                pickupTime: shipment.pickupTime.toNumber(),
                deliveryTime: shipment.deliveryTime.toNumber(),
                distance: shipment.distance.toNumber(),
                isPaid: shipment.isPaid,
                status: shipment.status,
            }));
            return allShipments;
        } catch (error) {
            console.log("Error getting shipment", error);
        }
    };

    const getShipmentCount = async () => {
        try {
            if (!window.ethereum) return "Install Metamask";

            const accounts = await window.ethereum.request({
                method: "eth_accounts",
            });
            const provider = new ethers.providers.JsonRpcProvider();
            const contract = fetchContract(provider);
            const shipmentCount = await contract.getShipmentCount(accounts[0]);
            return shipmentCount.toNumber();
        } catch (error) {
            console.log("Error getting shipment count", error);
        }
    };

    const completeShipment = async (completeShip) => {
        console.log(completeShip);

        const { receiver, index } = completeShip;
        try {
            if (!window.ethereum) return "Install Metamask";

            const accounts = await window.ethereum.request({
                method: "eth_accounts",
            });
            const web3Modal = new Web3Modal();
            const connection = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();
            const contract = fetchContract(signer);
            const transaction = await contract.completeShipment(
                accounts[0],
                receiver,
                index,
                {
                    gasLimit: 300000,
                }
            );
            await transaction.wait();
            console.log(transaction);
        } catch (error) {
            console.log("Error completing shipment", error);
        }
    };

    const getShipment = async (index) => {
        console.log(index * 1);
        try {
            if (!window.ethereum) return "Install Metamask";

            const accounts = await window.ethereum.request({
                method: "eth_accounts",
            });
            const provider = new ethers.providers.JsonRpcProvider();
            const contract = fetchContract(provider);
            const shipment = await contract.getShipment(accounts[0], index * 1);
            const SingleShipment = {
                sender: shipment[0],
                receiver: shipment[1],
                pickupTime: shipment[2].toNumber(),
                deliveryTime: shipment[3].toNumber(),
                distance: shipment[4].toNumber(),
                price: ethers.utils.formatEther(shipment[5].toString()),
                status: shipment[6],
                isPaid: shipment[7],
            };
            return SingleShipment;
        } catch (error) {
            console.log("Error getting shipment", error);
        }
    };

    const startShipment = async (getProduct) => {
        const { receiver, index } = getProduct;

        try {
            if (!window.ethereum) return "Install Metamask";

            const accounts = await window.ethereum.request({
                method: "eth_accounts",
            });
            const web3Modal = new Web3Modal();
            const connection = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();
            const contract = fetchContract(signer);
            const shipment = await contract.startShipment(
                accounts[0],
                receiver,
                index * 1
            );
            await shipment.wait();
            console.log(shipment);
        } catch (error) {
            console.log("Error starting shipment", error);
        }
    };

    const checkIfWalletConnected = async () => {
        try {
            if (!window.ethereum) return "Install Metamask";

            const accounts = await window.ethereum.request({
                method: "eth_accounts",
            });
            if (accounts.length) {
                setCurrentUser(accounts[0]);
            } else {
                return "No account";
            }
        } catch (error) {
            return "Not Connected";
        }
    };

    const connectWallet = async () => {
        try {
            if (!window.ethereum) return "Install Metamask";

            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
            setCurrentUser(accounts[0]);
        } catch (error) {
            return "Something went wrong.";
        }
    };

    useEffect(() => {
        checkIfWalletConnected();
    }, []);

    return (
        <TrackingContext.Provider
            value={{
                connectWallet,
                createShipment,
                getAllShipments,
                completeShipment,
                getShipment,
                startShipment,
                getShipmentCount,
                DappName,
                currentUser,
            }}
        >
            {children}
        </TrackingContext.Provider>
    );
};
