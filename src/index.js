import {
  opacity,
  topPx,
  transformRotateDeg,
  borderRadiusPx,
  heightPx,
  cssPx,
  heightObject,
  PropertyState,
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

/** */
class ElementIDClass {
  /**
   *
   * @param {number} count
   * @param {string} eleClass
   */
  constructor(count, eleClass) {
    this.eleClass = eleClass;
    this.eleID = eleClass + '-' + count;
  }

  /**
   * @return {Element|HTMLElement|Node}
   */
  get element() {
    return document.getElementById(this.eleID);
  }
}

/** */
class ServiceIDs {
  #serviceItemClass = 'portfolio-service-item';
  #serviceMenuClass = 'portfolio-service-menu';
  #serviceChevronWrapper = 'chevron-icon-wrapper';
  #serviceChevronLeftClass = 'chevron-bar-left';
  #serviceChevronRightClass = 'chevron-bar-right';

  /**
   *
   * @param {number} count
   * @param {string} wrapperClass
   */
  constructor(
      count,
      wrapperClass
  ) {
    this.wrapper = new ElementIDClass(count, wrapperClass);
    this.item = new ElementIDClass(count, this.#serviceItemClass);
    this.menu = new ElementIDClass(count, this.#serviceMenuClass);
    this.chevronWrapper = new ElementIDClass(
        count, this.#serviceChevronWrapper
    );
    this.chevronLeft = new ElementIDClass(count, this.#serviceChevronLeftClass);
    this.chevronRight = new ElementIDClass(
        count, this.#serviceChevronRightClass
    );
  }
}

/** */
class ServiceTransition {
  static #serviceWrapperClass = 'portfolio-service-item-wrapper';
  static #duration = 300;

  /**
   *
   * @param {number} count
   * @return {ServiceIDs}
   */
  static #addServiceIDs(count) {
    return new ServiceIDs(count, this.#serviceWrapperClass);
  }

  /**
   *
   * @param {string} menuID
   * @return {function(): string}
   */
  static #itemHeightPointStyleCallback(menuID) {
    return () => {
      const menu = document.getElementById(menuID);
      const menuHeight = PropertyState.parseValueOnly(
          getComputedStyle(menu).height
      );

      return cssPx(menuHeight);
    };
  }

  /**
   * @param {ServiceIDs} serviceIDs
   * @return {[number, number]} [closedTop, openedTop]
   */
  static #getChevronTopPoints(serviceIDs) {
    const chevronSize = PropertyState.parseValueOnly(
        getComputedStyle(serviceIDs.chevronWrapper.element).width
    );

    const chevronBarHeight = PropertyState.parseValueOnly(
        getComputedStyle(serviceIDs.chevronLeft.element).height
    );

    const chevronClosedTop = PropertyState.parseValueOnly(
        getComputedStyle(serviceIDs.chevronLeft.element).top
    );

    const chevronOpenedTop = chevronSize - chevronClosedTop - chevronBarHeight;

    return [chevronClosedTop, chevronOpenedTop];
  }

  /**
   *
   * @param {ServiceIDs} serviceIDs
   * @return {TransitionPlan}
   */
  static #generateTransitionPlan(serviceIDs) {
    const itemClosedHeightCallBack = this.#itemHeightPointStyleCallback(
        serviceIDs.menu.eleID
    );
    const itemOpenedHeightCallBack = this.#itemHeightPointStyleCallback(
        serviceIDs.item.eleID
    );

    const [closedTop, openedTop] = this.#getChevronTopPoints(serviceIDs);

    const transitionPlan = new TransitionPlan()
        .along(
            serviceIDs.wrapper.eleID,
            [
              heightObject(itemClosedHeightCallBack),
              heightObject(itemOpenedHeightCallBack)
            ],
            this.#duration,
            'easeOut'
        )
        .along(
            serviceIDs.chevronLeft.eleID,
            [
              transformRotateDeg(45) +
              topPx(closedTop),
              transformRotateDeg(-45) +
              topPx(openedTop)
            ],
            this.#duration,
            'easeOut'
        )
        .along(
            serviceIDs.chevronRight.eleID,
            [
              transformRotateDeg(-45) +
              topPx(closedTop),
              transformRotateDeg(45) +
              topPx(openedTop)
            ],
            this.#duration,
            'easeOut'
        );

    return transitionPlan;
  }

  /**
   *
   * @param {ServiceIDs} serviceIDs
   * @param {TransitionPlan} transitionPlan
   */
  static #attachEventHandler(serviceIDs, transitionPlan) {
    transitionPlan.responsive();
    serviceIDs.menu.element.addEventListener('click', (evt) => {
      transitionPlan.activate({autoReverse: true});
    });
  }

  /** */
  static ready() {
    const serviceWrappersNo = document
        .getElementsByClassName(this.#serviceWrapperClass).length;

    for (let i = 1; i <= serviceWrappersNo; i++) {
      const serviceIDs = this.#addServiceIDs(i);
      const transitionPlan = this.#generateTransitionPlan(serviceIDs);
      this.#attachEventHandler(serviceIDs, transitionPlan);
    }
  }
}

ServiceTransition.ready();
