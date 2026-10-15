"""SB UI Kit — serves the shared row style for the SB cards on every Home Assistant page.

No config entry, no entities: HA loads this integration because sb_scheduler, sb_watch and
sb_background list it as a manifest dependency. It registers one static path and adds the
module to every page with add_extra_js_url — dashboards AND sidebar pages (a Lovelace
resource would load on dashboards only). The module defines window.SBKit (see its header).
"""

from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType
from homeassistant.loader import async_get_integration

DOMAIN = "sb_ui_kit"
STATIC_URL = "/sb_ui_kit_static"
CONFIG_SCHEMA = cv.empty_config_schema(DOMAIN)
_LOGGER = logging.getLogger(__name__)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    integration = await async_get_integration(hass, DOMAIN)
    version = str(integration.version) if integration.version else "0"
    if hass.data.get(DOMAIN):
        return True
    hass.data[DOMAIN] = {"version": version}
    await hass.http.async_register_static_paths(
        [StaticPathConfig(STATIC_URL, str(Path(__file__).parent / "frontend"), False)])
    # the version is the cache-buster: a new kit release is fetched on the next page load
    add_extra_js_url(hass, f"{STATIC_URL}/sb-ui-kit.js?v={version}")
    _LOGGER.debug("SB UI Kit %s served at %s", version, STATIC_URL)
    return True
