# Copyright 2021-2025 Avaiga Private Limited
#
# Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with
# the License. You may obtain a copy of the License at
#
#        http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
# an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
# specific language governing permissions and limitations under the License.
# -----------------------------------------------------------------------------------------
# To execute this script, make sure that the taipy-gui package is installed in your
# Python environment and run:
#     python <script>
# -----------------------------------------------------------------------------------------
import random

from taipy.gui import Gui

# Data set made of two series of random numbers
data = [{"x": [random.random() + 1 for _ in range(100)]}, {"x": [random.random() + 1.1 for _ in range(100)]}]

options = [
    # First data set displayed as semi-transparent, green bars
    {"opacity": 0.5, "marker": {"color": "green"}},
    # Second data set displayed as semi-transparent, gray bars
    {"opacity": 0.5, "marker": {"color": "#888"}},
]

layout = {
    # Overlay the two histograms
    "barmode": "overlay",
    # Hide the legend
    "showlegend": False,
}

page = """

<|{data}|chart|type=histogram|options={options}|layout={layout}|>
"""

if __name__ == "__main__":
    Gui(page).run(title="Chart - Histogram - Overlay")