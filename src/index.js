import {
  opacity,
  topPx,
  transformRotateDeg,
  borderRadiusPx,
  heightPx,
  TransitionPlan
} from './transition-plan';

/**
 *
 * @param {string} elementID
 * @param {string} property
 * @return {number}
 */
function parseStyleValue(elementID, property) {
  return parseFloat(getComputedStyle(
      document.getElementById(elementID)
  ).getPropertyValue(property));
}

/**
 * Mobile Navigation Bar
 */
class MobileNavBar {
  static isExpanded = false;
  static topBarID = 'mobile-nav-icon-topbar';
  static bottomBarID = 'mobile-nav-icon-bottombar';
  static middleBarID = 'mobile-nav-icon-middlebar';
  static wrapperID = 'mobile-nav-wrapper';
  static containerID = 'mobile-nav-container';
  static headLineID = 'mobile-nav-headline';
  static topBarMoveBurger = null;
  static bottomBarMoveBurger = null;
  static barMoveClose = null;
  static navExpanded = null;
  static navHidden = null;
  static duration = 150;

  /**
   *
   */
  static #readyPoints() {
    this.topBarMoveBurger = parseStyleValue(
        MobileNavBar.topBarID,
        'top'
    );

    this.bottomBarMoveBurger = parseStyleValue(
        MobileNavBar.bottomBarID,
        'top'
    );

    this.barMoveClose = parseStyleValue(
        MobileNavBar.middleBarID,
        'top'
    );

    this.navExpanded = parseStyleValue(
        'mobile-nav-bar',
        'height'
    );

    this.navHidden = parseStyleValue(
        MobileNavBar.wrapperID,
        'height'
    );
  }

  /** @type {TransitionPlan} */
  static transition = null;

  /**
   *
   * @return {TransitionPlan}
   */
  static createTransition() {
    this.#readyPoints();

    const opacityTransition = [
      opacity(1),
      opacity(0)
    ];

    const wholeDuration = MobileNavBar.duration * 2;

    const navBarPlan = new TransitionPlan()
        .along(
            MobileNavBar.topBarID,
            [
              topPx(MobileNavBar.topBarMoveBurger),
              topPx(MobileNavBar.barMoveClose)
            ],
            MobileNavBar.duration
        )
        .along(
            MobileNavBar.bottomBarID,
            [
              topPx(MobileNavBar.bottomBarMoveBurger),
              topPx(MobileNavBar.barMoveClose)
            ],
            MobileNavBar.duration
        )
        .later(
            MobileNavBar.middleBarID,
            opacityTransition,
            0,
            'instant'
        )
        .along(
            MobileNavBar.topBarID,
            [
              transformRotateDeg(0) +
              borderRadiusPx(0),
              transformRotateDeg(-45) +
              borderRadiusPx(2)
            ],
            MobileNavBar.duration
        )
        .along(
            MobileNavBar.bottomBarID,
            [
              transformRotateDeg(0) +
              borderRadiusPx(0),
              transformRotateDeg(45) +
              borderRadiusPx(2)
            ],
            MobileNavBar.duration
        );

    MobileNavBar.transition = new TransitionPlan()
        .along(navBarPlan)
        .along(
            MobileNavBar.headLineID,
            opacityTransition,
            wholeDuration
        )
        .along(
            MobileNavBar.containerID,
            [
              opacity(0),
              opacity(1)
            ],
            wholeDuration
        )
        .along(
            MobileNavBar.wrapperID,
            [
              heightPx(MobileNavBar.navHidden),
              heightPx(MobileNavBar.navExpanded)
            ],
            wholeDuration
        );

    return MobileNavBar.transition;
  }
}

document.getElementById('mobile-nav-icon')
    .addEventListener('click', (evt) => {
      if (MobileNavBar.transition === null) {
        MobileNavBar.createTransition();
      }

      MobileNavBar.transition.activate({
        autoReverse: true,
        animationType: 'easeOut'
      });
    });
