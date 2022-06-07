import React, { useState, useRef } from "react";
import { Image } from "react-bootstrap";
import GreenDot from "../assets/img/walletSvg.png";
import bridgeLogoNew from "../assets/images/bridgeLogoNew.svg";
import { Link } from "react-router-dom";
import { useWeb3React } from "@web3-react/core";
import { useDispatch, useSelector } from "react-redux";
import { toggleDisconnect } from "../store/reducers/generalSlice";
import MenuLight from "../assets/img/light/menu.svg";

import VideoSvg from "../assets/images/menu/video.svg";
import MarkSvg from "../assets/images/menu/mark.svg";
import yellSvg from "../assets/images/menu/yell.svg";

import { DetectOutsideClick } from "../hooks/hookAssistors";

const NavBar = () => {
  const { account } = useWeb3React();

  const { elrondWallet, tronWallet } = useSelector((s) => s.general);
  const dispatch = useDispatch();
  const disconnect = () => {
    dispatch(toggleDisconnect(true));
  };
  const ref = useRef(null);
  const wallet = account
    ? account
    : elrondWallet
    ? elrondWallet
    : tronWallet
    ? tronWallet
    : "";
  const walletString = wallet
    ? `${wallet.substring(0, 6)}...${wallet.substring(wallet.length - 4)}`
    : "";

  const [modalIsOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(!modalIsOpen);

  DetectOutsideClick(ref, () =>
    setTimeout(() => {
      setIsOpen(false);
    }, 100)
  );

  return (
    <>
      <header className="siteHeader" id="headerArea">
        <div className="container">
          <div className="headerConent">
            <div className="headerLeft">
              {/* <div className="navBrand dark">
                <Link to="/" className="logo">
                  <Image src={Logo} fluid /><p>ALPHA</p>
                </Link>
              </div> */}
              <div className="navBrand light">
                <Link to="/" className="logo">
                  <Image src={bridgeLogoNew} />
                </Link>
              </div>
            </div>

            <div className="headerright">
              {wallet ? (
                <a onClick={disconnect} className="conWallBtn clickable">
                  {walletString} <Image src={GreenDot} fluid />
                </a>
              ) : (
                ""
              )}

              <div className="menuArea dark">
                {/* <span className="navTriger darkM"> <Image src={Menu} /></span> */}
                <div className="navTriger lightM" onClick={openModal}>
                  <Image src={MenuLight} />
                </div>
                {modalIsOpen ? (
                  <div className="navabar-pop-up-menu" ref={ref}>
                    <div className="navabar-pop-up">
                      <div
                        style={{ opacity: 0.6, pointerEvents: "none" }}
                        className="navbar-pop-up-row"
                      >
                        <img src={MarkSvg} alt={"mark"} />
                        About
                      </div>
                      <div
                        style={{ opacity: 0.6, pointerEvents: "none" }}
                        className="navbar-pop-up-row"
                      >
                        <img src={yellSvg} alt={"yell"} /> FAQs
                      </div>
                      <div
                        style={{ opacity: 0.6, pointerEvents: "none" }}
                        className="navbar-pop-up-row"
                      >
                        <img src={VideoSvg} alt={"video"} />
                        Video Tutorial
                      </div>
                    </div>
                  </div>
                ) : (
                  ""
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default NavBar;
