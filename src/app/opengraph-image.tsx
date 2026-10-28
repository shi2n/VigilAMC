import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'VigilAMC - Fire Safety AMC & Compliance Software India';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 70px',
          backgroundColor: '#FFFFFF',
          backgroundImage:
            'radial-gradient(circle at 80% 35%, rgba(234, 88, 12, 0.14) 0%, rgba(255, 140, 66, 0.06) 45%, transparent 70%), linear-gradient(180deg, #FFFFFF 0%, #FFF8F2 100%)',
          color: '#1C1917',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top bar with pill and branding */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 20px',
              borderRadius: '9999px',
              backgroundColor: '#FFF4EC',
              border: '1px solid #FED7AA',
              color: '#C2410C',
              fontSize: '15px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            <span>FIRE SAFETY AMC &amp; COMPLIANCE SOFTWARE - INDIA</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#C2410C',
              fontSize: '18px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
            }}
          >
            <span>vigilamc.com</span>
          </div>
        </div>

        {/* Center content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              fontSize: '58px',
              fontWeight: 900,
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              color: '#1C1917',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span>Never Miss a Fire Compliance</span>
            <span style={{ color: '#EA580C' }}>Deadline Again</span>
          </div>

          <div
            style={{
              fontSize: '24px',
              fontWeight: 500,
              lineHeight: 1.4,
              color: '#44403C',
              maxWidth: '960px',
            }}
          >
            Live GPS Proof &bull; Photo Evidence &bull; Client Signatures &bull; Compliance Reports in 1 Tap
          </div>
        </div>

        {/* Bottom brand bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '24px',
            borderTop: '1px solid #FED7AA',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAYAAABS3GwHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAEzUSURBVHhe7V13nBzFsZ7u2XAnBCKJnETOIkoIUEABCZGjQASTczDZJkcDJuccjDHYGAy2cRIODwee7YefsR9ggskmCyUkhIR2v/f7OuzN9U7e2bsT8Mf3252eTjNTVV1dXV3teZ73mud508IgQtL6IhaWflrY/i5s/f4CgrTvzfY8D2EQBm56O5ClnSx5+xrcdxr3LHH3ioLbhnsdlZYGectlgfs+g+luWghI+4oT3BupkbKhSAiRrp6k+0l54u61E7bdvO2HlUub1i6kacvNE3XtpheJFHWT9tMxQLCyFBX3GNy+uNdJ6UnIUi5TXsP4cchSXxq49bnXeZGmnrA8YWlZ7yfliYIpm54B+gLCHti9jkOWvK0grJ95YesJ1ufWn4aZsiJt/91+xd3PmpYVaepw3l0zA6SppC/DJY5gupvWU2il7VRlrRqZkRFS1Z0Dbr3Bb+LeKxJu3e51SFozAxSBsIaz3HfzheUPS4tDUv6k+3nyFtn/ngT7FtW/qPSseXoCKfqRnQFSVNrraHcfk+pPO7H/Cu1F8P1HfIvsDJCEOOnRCpLqtPfdfO51GuQpszAjz/PmKdNTSOpb4H7xDJAHimky6K+xD5iintjyMUgql3Q/CmnKpcnTCqIESF9DUv/S3G8bAyQ1Hod2lY27VyTsi21Xe+2qNw3Stp2UL+l+K8hat8nfGgMEpXbWDmRB0ugQdt/tT/DavZcWacqF5UmbFpeeB2F12bSwe0lgmazlwvKHpaVB1nIp8rfIACFpaRBVLiq9CLh1x33MsPSwtIURrTxHK2V7Ajn6l44BclScC2477nWRKKLuvHXkLVdU+awoor1W63DLu9c5kY4B+jLSvoiwfEwLS28XerKtvMhjws2SNwy2fLCepDrTfLuk+5kZIKzRsLSeRpo5QE8hrN2wtLRIUzZNnm4IeV8WmeuKKROVnhVxc033OiO6GCANIbv33eveRtb+ZM2fBu2o0yLNNyoaUe1FpadBWNm0z+bmUdcxDO3CKZ9tBFiY4b64qHth+dKmNXxy3PQeRNa2sz57Uv6egG230X4GBuhWzmWArA/UzvxZ8rrIUjZt3rT52oHebPuLhJD3mG0ECKkgFGnzLUxIeqbgff5Pyp8Waespss0vEbIxgEVPvuiebKtVuH11r9uBqDai0l0k5Uu63xNwhYt7vwXkY4AikfRAYffD0tqKjDpmkYh61qj0dqKVNlsp20Y0M0BvdLQ32iwa7XyGdtadBNu2K4XT9ClNnrRI26bNG/yNQTMD9BZSdPbLh5wjT9y7jLuXBWnqSZMnDVzmc++HISqfk94zDBDVmaKhpEROoulNpH0/afKlyVMkerq9JET1JyK9ZxigLyGLNEm6XyTStJUmT6soso0i68qDOIFo+pafAVTlEenB3zDE3fsiIctzZskbhizlo75dEWhXvW1CdgYIe3nudRKy5v8K6VHUuw2rJyzNRZo8RcNt072OQXYGyII8noVFI4xh86CIOlpBEe0XUYdFlrqy5E1Cq3U55TUDpK3U5stFVBG6WFpEtidi7vUB9OW+WfRGH3PRUPFozwjQmw/XW+0WjSzPkSZvmjxZ0Y46k5C1zaj8Jr09DJAFUR38sqI3hUcWpO1j2nxhsO+ilTrCEKiv9xkgC4p+EVHI006wTJTpLSy/mzdL20URR5o6imorC1ppL6qsk14cA0Q1WCTStpE2X1aE1dsg5JB7aZC3nIui6ukLyPIsWfKGoDgGSEJaCZImTx60Sqh50GpbecvnLeciSz1Z8rYNKa2OAVpsjQGSGopC3nJJyFpv1vxh5fLWkReBj9d2FNVOUfUkIkH1DPlu+RjAVtRjD/YlRl9/x1n65+a1zOymF42Y+vMxQBbENJ4Lbn3udTvgtuFeF4m0dafN1w60s+2kuuPux92LQPsZwEWOThaKQiROwlD7FfoGUnznnmcAFyk62WtwTZRx6I3nyNJmlrwuWinbLtg+RfUtLj1wr/cZ4MuM4MeI+mBRcPM7H7bpnpvmIk2evoQ0/U2RpzUGyCIhG2VCrt20LxvyvMdu5UPS+hLS9s/N5163ipD6WmOAr9CMIhm6qHoWJthn7qFn/4oB+hqCH76HiKBPIemZC2aQaAZotYFWy39R8dV7KQZR7zEqPQLRDJAFGRstHCsPFDh4e4EbjxP4yQUCUy4rYcrlJf1r8S0HNu3SEqZcUsKUi82v/R/ERWVMuaCMKeeXMeW8EqacW8KUc0qYclYJU75ZwpRvlDDljBKmnFbCr07x8cuv+/jt6VXcfVAJyy3a3F8XUe9vhSU83HO8xG8vqah2f3WejykXsj8Gps9P8hks1LOVu57vshKe5Luwz8z/VwTwbQdXOriKKKv/P75U4qZTJQ7dWWLFZZr7mwdRz54VaeoJyRPOAG5G97qvYJkBHm4+WmLm98vALyXwSwH8XABPGPyMkMATEvipAH4igB8H8LgAHgvgR0FIjUcl8IgEHpbA9yXwkAS+J4DvCuB+AdwngHsFcLcA7hTA7QK4xQNuY5kKDttKdutzlnd5wg4SeLqi+/GwAB5lP33gMfbN9JnPYMFn4jNa8Jktgu/k51K/p18EwPf3K9GFKQZPSuDX0vwK4A/sk49pP5G49mQfSy/e3O+iEPWuWlGDnDKtMUBUek9gzIYSb9zm6w9N4nxQoP6AQO17AnWDGtMIXj/gofZdgdr9BvcZ3Et4qN/joXaPQN3ibon6XRL1OwXqdwjUbxeo3SZQJ24RqN0kUL9RoHaDQO06D7VrPNSu9oBryAASuN7DL470scIA0dT3sPcWlrbaMhK/PrsMfM/TzPcdH/X7JOr3Co37PNTvE6h/x+B+gfp37a+n/z9g34un38WD/PVQf0hofN/gBwL1hw1+aPCIQI0w1/xd8KiHGpmNTPNniVcfKWPYRn5T39uJsHeVE+EMEERcY+499zoMafIkYcz6Hj69n5LZR+07Hmrq40v14RVxqw8vUfuuTqvfT0LxDLELRei1uwkPdf7eJTShW5DgSei3amKv3yxQtwR/o0CdRH+9QP06oQn/Kg8grveAG0r4/UkV7LBeM+GHIc372HETgT+eXwEe7tCMfqeHGvvJft8dAJ/LPKNiDMsc9h3wvZAxDFNYQaFghEXtIYGaYgipwP8W9Yclag+TKSTqP5KoP+4BfyhhxpQyhm3Y3O+8SPNOWskfQDIDuGhl+CkCI9cVmHWXD/BD8qPfK7UED3x0xRDfkQqU8uqekuzSSHZN6DUSupHuClbCk/ANwSvcQGL3DATq1wjUryakJvwbBHC9xB+Pldhtg2jCD3tnYWsAzNecV2CPIRJ/OkcC35Va/brD0/1Wz+EpxlAIMgafO5QhAiOGERgNplDMIDUzkCkCjFH7PhlDM0P9UR91qmO/9jD1pyVsuU53dS/smXuafsLaCaRlZ4C8CP+o2TBkkIdpN2sCUARMKUiCVtJcf/AaidwQu/5viL6h0kjU7zC4XaJGYre4RWppb4leSXkP9Ws9Q/AC9asE6lcKgLheADdI/OkEH3tt3Pzx24V9hkr85Twf+I4E7hHArV4X4/K3wRRmRLvLjHiKGaRhBi0cOIKSKZR6qJhBomZUSQ2JGpnBoP6QwfclahwhqDI94gG/9vHeoz7WX62rn61+73bA6VPPMUCr2HBFgQ+u99WkUxGt+chKilt1IAiVpoleMUqD6FlWonab7KbiUKev3Si7pP21VtJ7qF9FCNS/LQDiOqkI/39O9rHP4PyE78vmtLTgyLHfEIFnziEj+HoSTubl/ORWA8sMnL+oEcIKDAqHwOhAkAk4aioVUjOBHhUk6mQCNTro/xwd1AjB/2QGjgg/FMBvBN54qITVV2jub7vQIpM1M4AQ0UN4b2HQUgJvXKaJX31gEiwJV31gErYmcDJDrfEbJHpD8IroZZdef7M0qo5E/Xqp1ZsG4XdJ+/oVAiCuo7rj45lTSthvUxmqvmTBMkt6OGU/TiDzv3My0YHDJJ491wfu9ZUlqn6Tp5+P7+oWMzqod+V1GxXqdxk1MqAmKSbgCGuJn/8bDBFgCjPHqvH3IV+NCFSL8KSPF+/yscKSzX1tBUmEHryflDeAZgawFSRV0urHT4sVFxf417lSf9gbPE2wFooRutQYSjwSuvo1RK+giF6qvN2I3kr86yVqJHxKexI+if5KqYArPOBaqjo+/nZyCZM2EZApnj3NO/SlwKvfr+LSQ8KtKEnlgyj7Hg7dVuI5qkb36PeFG837IjMEVL3abR5qalQwc6GAilSjaqRGAg1F5Eo9MsxgDA32vgLT1ehAy5KnzKjP3OhjqcXyM7aFeo8p3ncWpJoDpH35RXcuiIGLCPz9TAlQcl1j1BJKaermN5CAtVVGqS9kBvuhlcQz0l5JeiPtb5YNK47W760lx0p8D7UrPdS+TXVHalXnRh9/P1nioC0kSjLbB416h8H0v9Jy9NcS9to2nAnCyrgI3quWPBw+QuKFC6gW8d0JQAkMMgNHBq9rVCATGEZQljCqR4oJtBHBMkJNwZpbOXfgPMLc7wYyh4c6zba/kvjDlRX078j2zrIg7TuJSevOACEZYtPDkDZvUr7Fqh7+eLxeVFKqiJ2EXiO0tL6W9ndDwNdre3xD2lHFaUh7LfEV4StVxxB+k6rj6cktdfxradIUePYUicOG+ii1oKsH0f2ZBRbvL/HuAyXgdxIf/UBilZjV1bj3FXavs+zh6JESL11U0iPCbZ4ZQT3zfgKjJkfLgFk1OBJY4teWNT15rt9n1iPUmoQxNBgoEyyZ5QEP+IXEL87zUSk19y8twp4tFhECOaKe6BEgDSIqDUVU3rB0frxfH0m1w0P9Mg/1Kwg9Ca2RWA1qDYbwNDMoJjAqDn9vpMQ3vxwxqOeTcQKEryW+12XVucnH86dLHDZEoOIn97UVDN+Iq69VgPb0JyV+fFb8KJAHi1Q8HD1C4sULpBkRpJ4sW5i5VHcm0IStJL0dCRpmZd7zNUj0NDI01lH0NRmuTtP0fZ5afX70dB8l510WBfebxGkkvBfML6IYwM0YhTR53Lxpyjw0iSupEvVLhca3yAh6MtrFDFRXuhhBjQoN9ahLxyfhdxG/RP0aqez3lokU4VPi3yTw4lllHLW1REcp/7Cd5vksLjvIU+4Gdbpb0IryYx87bJq/7Th0VjycONrHq98qAfdJgPq/HQ2CVjVjKVImZMMENWU6Nb9Mu8fvtp5iDQ2NtRRrhuX9ezzgpz5uO6zU1KciEfbew9IchDNAFFJU2DImb0w1RKJ2gadQv1igfolE/VtSMwFxOWFGBurrVxmiDqhHmhk04deu9xXh1wLED4L6960+XjqrhCO3Eugst4f4wjBwgMBH99Gvx1NmxNqDnvLt+d3Z7e3Doh0eThoj8MpF9GWSAImUTNAgWmsm1QSv0bWuUuM9Y15WEl8RvmthM4zFtDs48njAQz7GxCwSFoEs9Gny9g4DRNVD68pfjxDAJR5q5wrUz/dQv0CgfqFQjFC7xI4IAUYwqpGy3HAkoHqjmMCs2lLlsZKf9+ircyOd1Xy8+E0fR28tsUgl/4eJepYkXHuQdk6j1UT55DxIJzv66fjYco38/UmLRTsETp3g49VLubBIE7OR6Hf7mtA5D1Do0vM18TtSv0H4VvW0o2+XOlq7yVMm7CdOas9zpfkGYRpIpAoUhSwN5cG6SwnMP0sC5wnUz5GonyNQJyOcJ1CzzHBRcESQ3UcDTmSp25Pg7SjA+YElfFp1bvPxwlkCxw6XmSR+2HOFpaXBtuvSscwHHvK0fd2swtaoMz8icf4e+RfXohDV18U6PJy+QxmvX+0DD9ApUK8JaCYwqhAJP7iSbiW/JXzlK9XdrKwtbPqXRgrcIjDjhgqWXzz8nUf1r81IZoCe7NjENSVwYRn4pkDtTIH6Nz3UzxKon02GIDN4elQwI0L9Ek+PCGZ+oCw41mJEBrDzgRuMv84dPm7a20e/cnPbFu1+3sX7eXiJjPiI9cPhJFNgwb0eFlBffkjit99ongyHSbAiMaCfh3sOF8D3S6grr1NOco1VqOEwaBcWfWNiNla2hmk5ONcyI7IyVOiVc6qbWwRcJVpF1LuISg9BMgPkRVgnwtK6ILAjGeAsifrpnsYZAvVvkBGEZgQywXkCuFAAl3rA5XYSayw4hHVWsx/A+u5c7+Ofp5VD2m1GfD/DEVYmLO0np/vKd5/2cmVaNM56yjOVfj33S7x5lY9Fqs1lw+qLA/OnLyNQKUu8fE1JeZxqvd841Fmdn8TfWF+xC4qBdZWGaZnzrC5YYwWtevTnam47PdI/TypkZ4C4lxpMD8vnXrsYvIyHBacK4HSB+qkS9VPJCAL1Mzw1KijCv0hgwVkCn35dYtYxPmYeWcbMQ0uYcaCP6fv5mDHJx4y9fczcS+KTPSU+3VNi/j4SOFji/mFdqkVSX/LAPrOt2zXJXbq3tvSAq6a0rVPqBxz5lAnxLoGPrxZYMWSjSVKfw+67ae51F7Rq8qOvc3+FZUrHidCqPd0cBq0LCQ0MxkRtFhIVrhCoUVBdLfDp1WWsPjBcBWo3wuixiQHcDO51WjQIIGM9nSUPbx1VBs6UqJ0oUD9JoH6yB5zpoXamVIT+7o4VvL51Ba9uXsFrm1Xx+uYVvLlFGW8PLeOdYT4+GOFj6mgfM7aX+GSixKc7C8zbXQD7CjwzzoNUq7nxHyFtf7PkPWasD9B9mCul1l2bk0y6IdhJ5W164e+T6yTWXDa+j0lI268gaCp99dqSUsPUCGClfzed3yH+blLfED8NE1RLaawwBguqQH8/08/lANjtWWLs/GkRqC/7COBUUDAEHtyxBJwhUDvOQ/0ECZwqMOtgH69sU8XzG3TgxQ078OpmVbwxpII3h5Xx1tZlvL1NCe+MKOH9UT4+Gutj2gQfM3eU+GRniU93FZi3h0CN0vdrJewxqFm/bjfGb0h/ek56fe2CzN1nVHmUQ5rU7ghc8b6ZZlmJWddVsdJSXeWj3ndUuou0+Y7YTgKPcQ5gXKet2hOc8Fq1x6o8QadBS/w0TJDwL+VaDg0W9FSVuHiiYWqHiCP7F0bsYWlJ9UTny8cAmRDT4TCMWckDvu4BdIM4UWD6XmW8sGGnIv6XN63i1c2reH1IFW8OqxjiL+OdbUt4d0QJH4728fH2PqbvEGCA3STm7yVQmySAQyT+e6Kf+kUlIU09m60mMZ0beL5ntlzSpEi1hxtX1GYc7cxXo+38Ju4p9vHWRSUsauYAadooAgMWEXiD7uY0yyrpz5Vha+p09kpYya8cB7ULiSZ+WuXMes2lNFtLZbHDZR7mXuZjzaU1A9iFVvtsrT5jsK6MaA8DZOmM23n+//M+JeB0idmTfbywfhX/2riKlzftwL9J/EOreGMYpX9FEf9/ti0r4v9gu5KW/uN9zNhBKgaYvYvE3N0l5u0lsYAMsL8HHCaw+2rp1Qv3WcKu3TSL5Qd4eP1aCXDjCFUduh9ba4qSqiQs47pMyUpL1W0CTx0fqL+H3NNP38lX8xPlwmBVH0r/oKmzifgDK/MkfILmaUp/Q/z1S7Rx4p69mkfeqPcWhrC8YWlZkHkdIBQZJXwa7LSaBE4p4b3RZTy/fhUvblxVxP/aEDKAJn6qP0r1Ga5Vnw9G+5g6Tqs/MyZKzNpJYvauEp/uIfHZ3hKfTxKo7acZ4B97lWId3OzkNeoFR6UHQQewp87yAe6lDRA+fW60JcXXlhS6LN9IHVmvWXB311W7dJeUbt1umnudFQMXk3jvZgFwowulP/vK0YkMqgjf2PhJ/NaPSkl9S/yeUXlI+Ib4LzbS/wqJTy71sdoSAfUn4f3mRVR9UeltGwHSItgxt5M/315ixsgKXtmkin9vVsWrW2oGeMMwwNtbU/qX8O7IkiL+j8YY9YcMQPVnF4nZuxkG2EtiPhlgskD9ax5wgsSBa2eTrFbSu/2Mwm0H6DAq3Ktbozt3g/AtURnCUjvQOJH0lKWE7td6Q71Q7te2Pfr7r5GwySRt/9w81x5YUqFWODdRVh9uKlJqWUDft/b9KH3/EoEa12ZI+BdJ/Z/S/0YfF4wPWN8CDJAWbn/DEJYn+M0iaK19DBDWoSzYfCkP721TxhtbVPD6EI3X+DtUT3zfGa5Vn/dGaQaYOq6Ej8dT/6f09zF7Vx9zdpOYu6ceAebvK7FgfzKAAI7x8PIBUlmd3HaLwAFDGC+IBG987xv7jSVqNxkHPa6S2hVrSlVurr9O4O1zq+hf1cypN95wA47Ao5M9XDg2G9O6CPsmgwYKzKFPElekjeRXG4yCxB90HQ8SvtH1ldTnCj0XKC+UGvQ1+rbAv8/wG8+Th/jTIuzZUqB9DBAHlyOjcPuaEjOHlfHalmW8PqSMN4aWjerTRfxUfzj5nTpOaulP9WfnLvVn7l4S8yZJzN9PoHaAZoD6YZ6aYxy/SbLLQYTkiMTaAwVmXuMrXb52o6f8YGwMIeWd2s0rNbjJXgI3Sdy4a/MWyRt39IFbSzh7ZHJ/s+Kh433liar0fu4OcyV/cLJr7ftqomu8dS/2DPFL7apigIu5KOlj38GO6lMAA6T5DmnyZGKAuArdBR83bxwRxTHDmlUPb23p4z9DNQO8tVUZ/zF6PxngfUp/O/ndnpNfHzN30tafbgywr8Tnk6VigNrXPNSPoBrk4e3DpNp447abBlF9fvIY42p8PTegmPhBarGI3qhBs6FeJLI2c5CoripjuJmg23e6+3oCoBnxMh+37RTtUhzVnzhstZYAfkD3aGOVoppmg36pOUmgvyR+I/XRIH4SvvHRukCifj5hGOAqgd8f7XfRRgjx5+lzGMLqCUuz6QGaC2OALukTVUkYovJGpafNc84qEp+OKGnJT9XHmDzfM3Z/Lf2N9cdMfqn/U/35dE+BuXuLLgY4UKB+iED9cIH6UR5whsQFWzdL1bj+xGH/zfRkFtxb3PBKpYeqVC4ZyiVASVFLTHbySFOhxH9Op/nTvn+hVIdXTpRamp4n8I/DuS2zud0kRD3P77i6zogOVH3oDq1cmTkv0QzbZekhg5LwjcpDwrcqD4mfRH+e1DhfS//a5T6GrZJf+isiTZE/VZ6QNIMwBuhbWKLk4YWhPqaNNMQ/3BK/tvtPNabP6RO06dOqP3N2F5i7p8Bn+wjM31co/b92kED9UIH6EQL1owVwksD0EyWW69/crouYl6hAu/0bZ/gAVQXlnRpw0+b+hiskapdL1OwKqdWdlRSllJf436O7mwqP3NIHLi8BZwnlCrLgDInNlm1uOwq2z2F9n7QVXR64scWsRyi93zi2cVJuiJ/RMBqrug2pL4CGumMIX0EA53MyL3FvwOxpdf+wfvQymhkgDUepfAkvuEgcuaLE/LFW8vuG+Kn6lJTlR5k+1eQ3aP0RmLuXwLxJAvP3k1hA9ecgqUcAMsAxAvXjPeAcgatHtza5JE4ZxihxfsBL1Uj3b0nUlG1comYXh5SlJCg9PeACDy8dK5W1h/X5UuLpQ33gfIHa6R5qp2p/qJvHNI9YUYj6LnR5ePFy7j8wIWWsf0/DImWI353oUt/vJvUNzpUaZIBLPEw/T2KlAaa9HNI/Cxo06CyuxSGQr5kB+iLKwsPTQyRmj5H4YDut9pD4qfrQ8jNtB5o+/YD0p+5vpT/VH4EFB0rUviZRP1Q2RoD6CQI4zcOcU32sEeGnngYdJQ8vH0dVxbhrcycbCVxBmwUVrJVE6cuGeOjherYHnOVh7pk+1l+GBC6wztIS886QAIn/ZE/7RJ0iMOfrZaxpbeopEEYQZ0zUi3MqnCIlv6PzK1WNq7rdrDwkfqPv275zr4bqv9m7QQa42sc3RhrpbyV/m4g/DcKeP4BsDNBTEj8Muw4UqG0vMXWsVDZ/qj4N6T/RV6bPTwzx0wNU6f5G/flcqT8S9YNpAQqMACd4wMlav7535/SS1cUe63DolwD3L5ztNTbxdIOSkpZoSDBSEw7dvKmLnymAc31cuq3ux4HrecA3dP/qX5eo0zmQI9YpAreMSs8ALpZfwsP0W02QMYZUJPEba4/y3b9Se29a236Dka3k70b4mvhrdGE/my7qAi+d7Dc2Gimp7Ej/rLQTlT8sPe0IEEA0AyRVlOZ+XoaJyv+zzQQWTJRa8o+TWven9N+pu+7Pye9nVH/2Efh8PzKAmQBbBjhSoH6sVCNAnQxwhofa+T62XLE7YaXt/4M7SYBEQSIO7l8ggZNISCAKOr32TYm6gi6jXL5PFaif4mHGsQKbLiNw2XAylI/6SeynRP1YgRon7kd5mHWYxKBF8zHBrV/ztbszF+e4KT5o7bGTc2PerIVNdC3hG8a1z0FVkpaq3dfvmvj2hu4f1VZEencGcDMlcVTSvbj7eTBkgIfPJkrMnECbv1SSX018w3T/faz+L/C5Mn8a/Z8WoKMl6scJ1MgAXycBesDFEj/fP3oUiHqWAVUP7xxTVh6siohP4/4FQ9hnStS/IfWvujb3LE6XOj9VHPbjRKEk/MfHlPDWEWXgZPbTQ/1oTzPtERL1w+koKHHxFtn7Onhlgc8ZPpE2fy7QGfeLbsRPk2twYYsqnZX6lvAJMjqfjSADXCrx5NcCk/gYvT+sf2FpaZCmnCvIAmWiR4C+irsHS2BXiRk7CE38O/pddn/q/pT+VH+4+GXMn2oCrPR/MoBEjfr/cXoOwBGAhKgsLZdIjB6UTbIOX5FE6wMneqifRF3dMMKpEjW1qUeidord4EOC94HTNKGrvCR87ntgX44nwUvgOE9BqWnsK1U2jlzs/yECOMzDP3aRKEUQWBR+yX5y4mt9+pW1hwtctFwFLD12gn4e1TmvS+pT4lvCV0xNBqD09zD/PIlNlms2e6Yh0FZgBW3OdlpjgJyNtoTVF/HUYtdnuwjM2lF0s/vPVX4/VveXmE/it+oPV4AbJlBNaEqvNgxQp759icB/Hxm92BSGYzcUeh5BhjreEDJhN/TwVzGH1uVJ/AtOKeHzE6naeLoMyx5riP0oqmh6sU6NVsShErWDJeoHcTXbA8jQB5ew6VLxzBr8PjttQquPr0IlKge8gKlTmW25wGXNnJzENyboAXXHjGKcrzRGuW9yDcPHDRMCI1Jg8htHI0n34u7HIUO5eBWoXYhqJyrdvXfp+gLglsedBT7ZRSiffxK/9ftRqo+a/AaIn/p/YA1AEZ1iAKOGnKlNoriqhEkZQp5fPlQCXKwiUx1DCNQouY/xtN5uGYP7G07z8cKBPg7bQGLeMb7a86DUG0X0pm+OtFf9JuEfqJl5AS1a+wngYB8HrZGun+WSh/+7kGHUjY8PJ70N4g/x56G+T+K3E3RKeTtXUeqbbDAA5z4fnlHBcv2bpT+v476pRZo8Nl/avFEIli/GHboXsHjJw2sTBBbsJTBnN2FUH+31+dk+9PzUqo9iAC5+WeKnND1SaqJTDCD1CEAG4NCuJnICL53moyNl5IhbhgmA9ZFolcSm9NYEXSNhk9noHnGch6mH+1hzcYkNlvAAumMECL5GBImeTHug9l/iIp56Hq5ncE6zrwAOlDjbTjgTCOP40RJgSHMGxr1eAvRDos4fXNm1hG/1favnW2lP4ud7IqgyctQkA1wkcJydj+RUfRyibLqfBjnLFc8AOTuSGUeuzg0uEvPp7sCJb0P60/EtoPuTAUhU1vypiDLAANTBqbPzQ1PqcSXz+hJOMOZIF+6wfuc2EjiK6omniLZ2sKfbIzGzzcMkcKQEjpHYaWWWERi+PPV4AViCZzlCSXpN9LX9hZL2JHqOZvM5qSdzU73j9s79JS7ZKF4FIgYu6uH9q6x/kiP5uWBnpX7QvGnVncZk3c5raKmSqHP+cpoELijh2SO79laod2P/R9BCWFoeFFRPMwOEVRyW1hsI9qMsPfx9vA9MJuELzCPx79PFAEr3J/FTkjYYQGoGoIpiJ8FBBqC+S0euKwTeOdfHkv2SCeyaLXyAOvpkT3ubHsR2DTjxZgS4IyUeGNEVkmXNRT3MO6istmjWWeYAlteqTY1uG1TfqMaR4PlcdOjj6LaHwGc08+4mlQp46prR78fiOsZZperDU2+4cd1Ifm3pMR6cXMDi6BfU9U+nymaJ3hA+1UUFvYCI80vYYa1my09YP2z/ou4ViQxtNDNAWuR9mKQySfeDGE9JSt2YxKKsPlr3164Pmvi6qz9mAswJp5qwGquNmgMEGOBiBsuVuHiH5m18Lk7jIhil9iQPNRIwF93IfAacsH68t8BKnV1lKtLDi7v4APs2mWUlPueahZHuiuBpzeKknnMbLu7RxMt1jl0E5uwsgT18HGydzSKw0YoC83iU7C08wtWYOqn2kPitP48xbyorWFDl4TtRlirzjigoCDLAKXrd4+HdAu0HJr7BPuSlkyIQbNf+d/rSxQBJnUy6XwTcNtzrsPQnRmsJTL1YTXz3o85spb/XffVXSX+9BqCkvwq7YucAZtGKqgAZ4EoPs74tsWogOkNY++OW8VTIFXDH2SSBBSRmRdBaXcFBPu7cMugYRqIRuGoTRqkQWEDCbxC9lvKK4GnWVQQvMZtm3p2ECvMya6LE7IkCn+/sY9sl4xngZ/T15xZH2vqp9jDKdlDfP4cr147K01iUCxA9F+OUNUu/M3rRfnpmBWvZ9h3iDxJ9EgOkzReHLOUiGaCnkKWzabDxEgLzDvKVpFUTRKoSShWh9DeLX3b1V0l/qaU/PyY/Lj80J3Rc0aR7AgmDPj2XcX+uwJ0HxI8CS1U8TN3NB7jmsKcOwTLPSG4VjmVSCdst63hGeh7WX0wT+gLm311gPifyJPqdJebsJDCb5l1D8DO5yZ/eruMJgbkTJF4ZIbFYTMz9iTx74O6S3mtMf35KfmXiDPgg2YmulfhBwifRK8I3K+bKtMs0AZwtcfEIYy6OkPyFosC628oAwcqLJvQ43MAtiFRxqIoQVvU5RGrLyuG0yBgzJdWfoPTnR6fTGaWgmgQbQqGefI3A5zeVlCrhthnEY9tWgMklzFXqicbcXQWwp8SL4yQ6Inz4r1zfAzi5JeFzEz8X9iyxc6V7e4npdPkgxhqMkcon6p6ABcgFPUr/Qfs8Hd3UhFdHZ1DEb1d0u7lhmImtXZSz0p5QC3RdaxuM2vf6kRKLVnRb1t+nGwNkMIEGERwNwtLzIKFsegZIqKhXsWynhw8nS+BQDzUSvpL8ZuXXTH4bDMAFMMsAypphJCDt3SQOEgndlSkxGWz3Ng+PHRFNbMSuywmAEnyiUOrJnB0l5uwo1Ir1ozEuC4txr8PYErAbiV1gxjhCYjr3ONDhb7RU+IgBv7j5h9EvRvj4bDuJnWIWwU4cxUDAnPCag0Ws5A+aNxuqDi1hWrI3pL1atzCqIgWGXcsgA3zTx/4bBMyewd8WVZk8SNNWjGBOzwCtoq1DpOfh1I2l8pGpHxo0Q0rUDpdG/en6mMoHyGEAZQHhaZR0VSYD0C2AJ0Re7QF3lLH9BtGqkM/D7rYRAKX/BInZ3JswXgITfVyxdjQDEIMZkmSMxNyxAh9vJzBtO4mPR0l8OFITO/Hetj7e3cbHO1v7mDncx+839ZWLuFsXsRwP3rjCV6qP2nxDdY7Er8ybXpfUNxKfm4KUWzjfiSX4BvTCnn1vlP7/NSmwUm7UH/5vJ+HHEHBoelSeEORjALexDA3mRlIbHb6H52jyO9YuStFxzBB/w/Rp9H9r/qSFwy6C2QmwGgFMZDPuhmJU47t8PH16PCHvvawAdpH4bILAjLES00dL1Lf3ceoq3cu5746/o5fw8Ml2EjO3k/houMT72/h4bxsf725dwn+GlfCfrXy8PbSEt4f6mLNtCbvGSP+buUbAwFu0+HDzDd0aONm1Ko+x7tQa/keW8A2xc55kXTIsjtEM8vnXJTYP+Pu4rs5pkIZewtSpMLh1JdUbgngGyFFhrrJpo58ljSK7DWI4RbolGKuPJX7rpmCtP9YHiCoAw7CrVWC9o6kbA3CxyJ4hdrfA5K26iNl9+cQT3BO8k8QMEvIIiQWjJM5Xm9yTn++c1QQwRuK9rRkEQBP8m0NKeGOLEt7YvIzXtyhh1rAyvhO0uzvYnN6eDBXPk+25wqskP5+PoeY9/bx8brO3QEl2umwECT7gklGz7/Bo7p/2cdvYLunfIH5j93ffRRBx99qGEFoJ6Wc8A6RBmoezeeLy5r3n4te0yPAjH2U+rHJFMMO4tf6cZHZZWfs/pSN99xnVgDu2LjbbGBUD6GhodCJ79bJKt7j99oXa/q3e6eGD0RKfUXcfLvD5CIl7lQqUzACdUuBPgyWmbuXjrS1KeH2zEl7dtKzw8uAy3tu8jH8OLmPZgIuGbrur7l8d7av1i5ramWaYuqHv0+WaAYf5LuhpatysSfQkdOt4R4NB4D/v4XgPHxwpsewi4WbPMGT5Zu1Cij4kM0CKSjKh6PpcbDpQKE9LfjQt4QITuYb1x1ObTxRhkEDs4RuKAXzUL/FRv8zX2wKpSnAewAP17vdx6rhmVSj4TBOW9FAbLTBnhMDcbSWe2iRaYruYtJTE9C1LeHVwWeGljcr41wYVvMHQkBuVMNQSYAh230ifZs8QKsqHn88UUHnUc1MAqI01AY/ToOOdnTs13DiE9lk61ccxG3VNfPOoPkS7v30SQtpPZoC0CKk8Nr2duI3OX1zYIhMYT8wG8VvbP33yG9Lf6P+UmnQPsGeQmUP4eJYw3YdpVvzoaokVE/YPH7OiBEZJzBsh8fpQH8ukjEC3YlnguQ1LeH2jEl7aoIzn16vg5XWreGGdCsY4O8CC75VnAb9yJiNS8Cw1w9B2g47ZaKMEQEDi0/mufoiHGqEsZxqN/2b9hB6r/zuprFxPVHsO8QdHwKzIWy6pbNw9B+EMkKGCXPnzlk37slfsLzDtBB+glA/atGnuM45cyqX3G9yeaFZDjfoDxQA6mkMXA5hIbpwL3Ctx8+TkPQPHryxRHymwYFsfey/VPGqEoSI8PLVOCe8MLuGFdSt4e90OPD2oii064sufzbj+PIroHA81q/LYia6S+gFVJyDxFbFztdw44im3a+6dNu7jXFvB8T5GrqCZL0zyq2+i0uKFglvGTQtDVL6o9Cww885iGMCFLZ+nnrREnoRTh9BfRQJBXxb6sZiFL7Wbiau/1P25YT2g/6tAr4oBGL1N6nkApStVoZs8zLvFx/rLJ31wgV2WFHhviMRT1m6egAElgT+vU8bUwRVM27CCe1YsY6WEQ7tXHiAwg7485/MUHTOvOcWcsKOkPgnfbK5RUr+796laPLT7DRg540D6UOkAAjQr3z+mu7ObWvRy+hB17aZnRdwcIy+cPoUzQCvI8tBZ8kYhqg6GKnn+CB+gdD9V6G2JwYUvqkg8kvUcX2/2pv0/IP1rag7go/5tws4F9DZCWoR+dFQ6omZ4x6c39LH/wOT8ExaTmDe4gilrlrHvgOT8xAN76qhy6lRNNdE16h7nPUGprwjfM5trLEy4SOV+rfdP6B10UrlrTz/YxyqBjS5xBNkg+pg8eRD1faPSU6Grj80M4FbsPpB7PyvSlg/LF5bWuBfy4nddi2cOSxX1Qfn7UDUglO6vpT9Hie4MYC1AhgEY0Y1QUd6MReg6D7jTx9j10hFp/5LAtv0FZMg9Cz7b3osKHLpk9CKXi1E0nXLU4hlqHOmCuj7Nl1wHUdspjcQ/wFObaxSRG2LXu8zMZhuzhZSjAo72caqd+BIh6k8U4r5TGmQtn5Q/5n4zA7gFYwq3HWFth6XF4Zf7+VqvJ9EHNnJry4+J1UP1x64AX0rpr9UfhjK0AWxrHAXIAIzxyVDmdwj85QwZynhBpO1v2nwWPGzuL4wcd65ArWHe1PsdaMakDxT3Eds9Ce7OMrVhiL9qh5k+QITXdM/GIQL/3N3vmvgSruoT89xpnyVtvqyIqjckPZ4B8iCkkVhkyZ8lr8Vmy0vMP9dXkQso9VVMHhuzRy1+SdQukKhRkl7ia+lPlcLo/1r686xb/WvjfdJRDndJHBxYHEtCVP+j0l0E8x3K6BgXlLRaR2tXI3qEdgGnxF9woPaMbewuUy7jdB3XUIEDJnHzDfdUSLURB/uTAXyMNRPfoOQPtp/E+GF9bifYjm3L/Y1B8QwQhxQdSoWs9dw40Qeoy58jULOEr06e77L+qK2BlP4mjmdjAqyI30edMEFu1ZyATHCjhzcu9LFYR3ObLoIfqFUs2enhbe4zPl2gZnX9w4xJk6oOCV9Jew1N6Pq8ZLVrzkDtODO7zhbsI1FXBwkKPDw8/S6vKOj80abbsOs8aLGOLgbIU1Fcmbh7RSGqDTd92f4CH37T17E7g2EK+Z+bQ6ztn+4DjRGAvkAkdL87Axjo6M8ecLvE+ROj/X3C0CozXE2zJ9cvaN6krs8N9YcILLCqDtUcSvtJOj4S90qrgAEGPDOB4H+7EWcBfYgmS8zaz8eqboSHkD7EwT5bK8+YhGDdadsJyZdvBHArcq+TkDV/VoR9gOMZDvxqqU6bVwtehDrOR/v+4Ft+1wmHZACl+mjiV79X+F1qkT0hhZtmrvLwybdLWN0cAVoE4t7PBksLfHayr703ad6kPZ/qzgFG4hvCV5vo99YhIlXIGLprW/DaQG3c2VOithd3qPk4a8Nm6e/2oQlp8kQg7lnbjULCoqR5AJdbLdx8aRBXzr0XvK7QW/Skkgr+VFPbHo3J0xzm1lB7KPn5S6IPonEGro8aD39ulOfZXhL37p3e5SEJ7nME8ZOdGIjLRLgm8R9k1B1OZinx1fZKYfYUM2SMUIeFzyG4YYdxlLgBR+0xFpi7m95/zCgTz0300eEHpH9I+6EIyRv2DGFpYUibL0t+m8fJ2zoDBOESuns/C1otH4bt1zDREDgXYLBaMoI1eRq1R+n9lPYKZhTgr5L4HCV4BkD3kOe4yMOCS2VTcN0wwsgC9x3sTLMnV3ap8jR0fT2RtZvpVYgYtYm+i+C5n1iDe4u5x1iofcbcbzx3N4HP9yAD+NgpMPENW/VtN9znzYqk8iH0WSwDuEjqUFzekM6mRlz+x/f1VSg/7ShmVoKp+zeOLzKT3ACsylMj8XOuoMKJBM7EOtdTI8vvDo4fBeL6lQSeaPkv7nc42kh97n1W8YIkPrPSnkS/q1AHhDNe6ic8LpbhIwmzv1inaUZQDMCtm5MkHhvWbPN3+5t03VPI1K7DxN3oSrSZAdIi0wOlRFSd6w2UmHNOScfyp0sEmYCmRFqFyADXcsJr3R+o/lgGoOpjToCxxwI1IibrAy44j5i0Yfa5QFRfgziLsT1p51fEr6NOUNVhnCBKcaozSrJzM/2OEjPVZnpfbajn6TlqY30AzDNnJ4na7oyqXcJaQU/TEMmfpo9FI67NuHthiMjfzAARGSOh8oe8sDzI2nZsuZhNNleMMU5vymks4D7AKAgkbB5jqg6JM8ygTksxliIVOdmoT+qAC70Syw0nOM/Dy8fzgIjmNtPAPof7PKv29zCD9vmDPC31qe4Yia/0e4ZO4RkJJoLEDIaPH2/AjfXEeIkZBjMnCMzaQeBT7lueJHHh+s0TX7cPPYl2t836TRvNDNButPvh0mCJTg/vfF0fPqdcCGwkhOMkaowdys3hdIhjSBGel0UGoHWoEVPHrCOwPH2K1EiifXHoenHmVvGqUFZ8b6RUnpm1fTzM39Mz0eF09AkVL2hHoaNIGIKfRoyT6hCRj200CZ6kadK5AX/WBAHsJvDKOIl+JrxKnDDrC98tL2L63vMM4CLMu7AIBOsMcHwDh3EllYTczW1YqLMDaoeZs8RobeHGcrpCM0yKYgAzSqhN5gHit5vMT/Ew7XgfK+U8wcXFCEacOFgCDPi1l6diCH2qJL7W6zXhC0wfJxRxTx3ThY94iqbBx2N8fMxoE2N9xQBzdtCRLHYPerXG6MtFoOj6ouC2414H0D4GcBt1r6OQNl+rkMLDnxlQi2rMSQK1wG4p7oVVTKCOVaWqZBfJugJLqViaNqiU3XHFUIs83OIMibsD+2fzgv4+f+WBdrTxM+gWVR6GhKfE30FoVWf7LklPov9wO4PRvv5lSJXtfEzdTodYYVyhmdvrDfxPDHEmvk77rXyLVsq2gqR2nfvtY4CFASNWISFz44yOiVM7lvGDyADSjAJ0IaaDmPaPr5ER7OkpZJzA5pPglkNGpqgdJ7HFwC7pmvRhwnD02lKdA8BFqs+o61Pqk/Ap8Y06oyU9id7HB4wbNNLH+yNLeN/8Mo1MwDArU0dJTB8jMHe8Dt+yXosrvhZhfkF5nrcXkJ8B0j5gMF/aMlnQap0P7uorvZ1zADJAnQG0jmQ8IV8H1yID0Hee3pOM+cnFJ6o9LEPPUkZVs5EWjDemPsfLw5M7B0IiBtrk/yDcPhFLVT28x77t00X8n5D4txeYxhhCJHwl4aUheh/vDdfgYeL2QHF1qDjjCzUYQAI7S1yydvOaRVRfklBkubC0NqL9DJAHaetOmy8Og5YQ+OS0EsCdYsfrEIp2BKiRARhljgxgVltpgVEOZPSzP4XBokxUNfrhBzagqO2Ex/nYfbVkb9Gw57iJZs99BT5jsC3a7mndodSnqmMJf4RUxK2IfttSA+9sU8I7/DXX7w/XAbbIAPO3F3h5pMRiCTvN4vrWKvLW6QoR934O5GeAIlHQwzSQtb5zeMo7PURP0AfoMZqcZQB9Nhd3TpmNI+awis/MsUzzOCIwshrVH3uS46G+3lJ4mIfnd5eoxgSxtQj2ebPFBT7f3ccCSv6JQgXEVYTPA8It4Q+XeHcbiXe28fEfE0Dr7a3LeHvrEt4eVsbbDKi1tWYGRpX7YLiPj+lEN0Fiz2XTEX8Ssr7nPohsDNCOBy6yTtYVVV9UOtGv7OHfR5X0gRDcTaXi5DCwrmYAddiFcTHm2QNq9XUvHslqQpfvITGfjHKUCdL7NbPVkGd5HSZw1sbJo0AQv9laW2hoqZlFlWe06JL4wyXeI+FvLfE2YwgN9fHWViW8acGAWluVVNrbxDAdUpHhFTHOx882L9ZEaxH3fsOQNX+b0MwAYROavgT14gJ9jCP6LJjEgy5o0bGbSxoMYE594abxA/ROKvrX08WYIwDPKCMTzOLK6u4S87mdkNajyR7qZIADBKZPrmKlmJg+QUxewdMxRsczxKKOFfrRSCvxffxnmFQhEt/cUuKNLX28sWUJryuUzW8JrzOi3BAdWe6toSW8u7WPj4f7mDZCYqP+zW0WjSK+RxKCbbTQXjMD5EELHehT+M0+PvANX5/0aEyhah5gtxWakxrVBpPGKCAwezehTqzUq7C+OrNYneR4AO33Uh2ScUdMlGiLpcoe3hollJ7OQLlTRwp8yFih20pFxJT4bw7x8foWPl7bvKTw6mYl/LuBMl7dXOM1hlTcsoS3hvh4Z5gPjCnhokHJfciDuO+vBFSBQjWurRwohgEsCu5coUjTt6ErSNROL+mocoFN5frURj0XUKMA1SCz0YSH883Znce16hPryQRcceWqLFdr1S6rvfQK7pAlmtsM4oa1PGB7Dx+PEviQ6g5VHUr8YVrVeWMICd9XxP4KsUkJLzN04qZlvLSp/v+KgmYMxhVluWnb+nhxqMQSIQG64iSpe50V7ugcVl9SWrsWSg2aGaDIxrLWZfMnvbQiEFXvrTQT0sx5lKdjZHI9wFqDDvJ1NAVagwIMoOYCu2kPTDqh0fmMTKAXnziR9dQRSn8eW0JZdl8bsP3YrJ+HaVsJfDxc4P1tBN4dJvHWUKmI/vUtfSXR/725r4j75U1KeHFwGf8iNjYw10x/aXAJ/960pALqctT4bITEHjk27LiE6N7Pi6h3H4Ws+TOgmQGyopXOtVK2XViun8DUo3Vs0VrDqqMZQE2GjTWIPviKAcxkmPo/VZ9ZOwnNAOMlpo6ljV6rMNTnsV8FRwUOt9Y+9wJVKfDI6hJvb0a9XuKtIVKpOa8Sm5cU0b+0iY8XB5PwS3hx4zJe2KiM5zas4LkNy3huozKeD4D3ORL8e/MSPtmmhJ+kCMzVF79FFrj9d68jEM8AKStp5G3KX6DUKBpNfQ3gBB5gxxVeTobVnls7AuhRwG5CmUdzKPfWchTYXWD2rgKzOBfYUWL6BImp4/QqLU2XVGlmjhJ4faTEiirCdJdEPn1pH6+sX8Lf1vPxzw18/GvjEv5liJ1S/YWNy3h+w5Im9g00/rl+Bf9QKOOfG1TwfwQZYgPNHC9tUsKbW5bw/lAfg1NOwKMQ+m2/GIhngIUV7sdyr5PAeDjP7l8CGEvUzgW4JmDmAZwM23mAirRg9t3OMWoQ5wIcBT42fjr0wflgpMA7WwvMHSXwm419DJUlrCdLOKSzjN+uVMZTa5Twp7VK+PNaJfzPumU8u35ZEfez69n/muCfXa+C/11X4+/r6muC98gUz21QUczywkYlfDK0hItXbo34o5D1nfYVOP3+4jFAmLRyr9NgwqpChQUHLUKHe9okqixCXdYgywRq87kZBebs2jUX4ChAJvhojGYAmjJpz587RuJ7y1Vxgd8Pjy/dgSdWqOCJFSt4ctUKnlq9gj+sWcHTa1bw57Ur+KvB/6xdwTNrV/HMOkTF/Fbxt3WqmiHWqeDZdSt4TjFBCW8M9vHXDXwsbvf4JkC9t4QR232P9tpN7wkU1GbrDOB2xL1Oi7zl2olHd2RwXRtO3MwFGDnZrgsYkyhVIbUJ3apCtAhxV5adDI8R+HA7oXx36JzGFdmXh5Zw+2Id+NmyZTy2bAWPLlvB48tX8fOVq5iySgeeXLWK3w2q4g+rV/GnNSp4evUKnl6jiqfXrOLPa1Xxl7Wq+OtaVfzPWlU8s3YFf1u7gr+vXcE/1i3jhQ3K+HCwj10HxBB/ArETvUngRA+02zoDFI08D52mTJo8br41B3iYzfOxeLAeV4fpHcq5gHWPsP5BJhqDirlDVciOAjsKTB8v8PE40XBVfn+knhjP3l7ifzcs48ElKvjBUhU8vHQFP1imioeX68CPVujET1fqxC9XJiN04LerVfFfq1Xx1GpV/H71Kv64Rgf+tEYHnl6jA/+9RhV/WaOCZ9as4G9rcSQo4Z2NS3hgUPKKr/tOwq7dtJ5EVNtJI1USAvWGM0BYw2Fp7v00edw0F2ny9CQuYJh1ujvzRBUbZVkxgEDdhhxsMIFmAIYcUUygLEKGCcZyBBD4gBPi7aRyb6Bz2mPLlXH/gAoeWLKK7y7Vie8s1YkHBnbih8t14vEVOvDESh34xUodmLJyB36zSgf+a5DGU4M68IdBVfxptSr+e1AFf1m9gmfWKuO5dct4eYMS1uvoLv2Leq9F1ZMF7WjT1BnOAGFI04k0eRY2LFLy8ArDhdPdWY0CZl2ADNAt7qYON0g1SIcl0X5CVIW4cUX57iu/fT0P+HCkxMyxAq9s7uP+xSq4Z0AVdw7owB0DOnHPEp24f6lOPLRMJx5ZrhM/Xr4TP1uhA79aqQO/XqUDv121A79btQNPrdqBP6xWxdOrVfDnQXoUeHuDCs5YJln69ySKoos89SSUiWeAVoeatEjoZI8hqh97Mcz6Kb5xdTYMYCbDjdj6gQmxWhwz6wKfcHWYE+Lx3LXlK7MoRwGqQR+NEvh0nMCTq5RxS78KbulfxU39O3HrYp24c/FO3LtkJ763dCd+uEwnHl++H55YoVOPBmSElar47cpVPLVKFX9ctaJGgefWquA3q5fQPxDVOeqZQtMTvjfLhJZLQNRqblhaGuQtF4IuBiiwUoVW6gsr2wozhtWX5T7xq13MKOC6R5AJ1ChgIi5zbWBPHZyqm0WIDGB2cHEUUKrQSIlZoz38Z6jEnYtWcOMiVVy/SAeu79+JmxbtxG0cDZbshwcMEzy2XCd+slwnfr5CB6asUMWvV+zA71au4g+rVvH0oApeWruKHfonL3oRYc8cltZT6KW240eAPCjqQdx6kq6T0sOQJe9GSwvMO16bRfVcwFiEuFnGjAKKCbg2YD1FG5NhiekBi5DdyUUGoMMbT4l/ep0Srq5WcU2/DlzVrxPXLNIPNy7WD7cv3g/3LtkP31u6H34wsBM/WkYzwS/IBCt24LcrVfH7Vat4fo0O3Lp8panfaZHlXbiIKxt3rxUUVG8yA7ChYGNhDYel5UWRdRWNq+lTzwnx4Z7ZL6wZQI0CB0i1bVLNBRiNeU8TuoRR2oyT3HR6eXIybPfwUg0aKTBjO4HZYyS+O7CCyyoduLJfJ67o7Idr+vfDzQP64Y7F++G+JfrhgSU78fDSnXhsmU78lEywPJmAKhBHgA6sUY4xewaQ9R1H5bfpSaNzWPnQtBT1uOXc6zQIlElmgCzI05lWkbfNPOUWr3p46xBfmUUbFiHlHmFVITMX2FsHnFXhClXENuMkx51dVIPG6pAljNagN6xLzB4n8OZWEtd2VnFZtQOXd3Tiys5+uG7RRXDzYv1wx4B+uHfxTjy4VCceHtiJx5btwM+W61BM8I/VOnH8kq1HobDI+m7c/O61C0vISfmKRkh7xTLAlwEHrCu1i4QKTa4PnbNMoBzleOwQ3SMME8zl6vAuOj4nQ5nodQGuDjNsSRfo/z9vew/PbuzjikoHrqh24Nsdnbi63yK4jiMBJ8YDOnH/EoYJlu7A48t24NfLdeDxVStYLMTVOS9aJc5WyhYB236KfuRngBSVtxXtaj9Nvb/ZVer4/IfqM3YVE/B40f31NsgFPIKITMBRwERxUxtmJjKWj1BzAW0R0iMAIzbQYW7adh7mjxf4v03KuKragcsqnbi6s58aCTgxvn2xTtyzeCe+Y5jgh0v2w9/WrGLCwOY+hj1TmmdLizR1xeWJu9eDyM8AfRE99VI3WUpgHo8o4uKYsgYZJjAMUNtXYIEJWa7mAsY9gnMB6yptY/ooi5BZHebkmGFLPt9B4JUtfdy+eBXn+524tNKJa/v1w82L9sNti3XitkU7cXv/Tjy/bgce3MSHFzzMziBOikelfwkRzQDtfEkLa91BXLqVBBhMl6MAmYCTYVqDJptRgDGEGMRWLYwJ4ynKUUA7yWmLEIneqEHGKqRHAoH54/XOsJ8NKuHOAVXcvAiZoBM3L9qBHyzbgec3K2HmOInV+jX3LQtaeV9xZePutYKC641mgHYiabbfyBeS1lewSFngxf05IdbHFAVXhjUDCMUA87lfQJ3UIjGbcwFrEeIooEKddIUz5ChAJiDhTxvlYeZogbnbC8zcTuCtrSRe2MzHa0O5diCAnTwcs1I6q09LEKLpewW/S7u/UZvrT2aANncgFr3ZtouwvoxhaMUTfYArxDyFXY0C+qxdqkGcB3wenAyruQAtQnouwPCGtAjZhTG7OEbT6NQRelO8ZgbNENNHaZMpxnn45SbxxB/W37j0pHu9iVb6lVA2mQHcShIqzIS4uuLuhaGd+ePyXr2Nr61CtAhxLqDWA7rmAZ/vw1GAJlHrH2SD25pRIDAXaMwHRkh8MFwoRiD4//3heqP8J6N12rotqj49ibj3l5QnKj0OLGPh3nOQjgGKQliHwtJiYYbjpHKt3k+LjpKHvzGcygkS4OqwCaPImEC1/Xj+rlaFGhYhc5KLngtYi5DeNGPdpRnukJtnLN7dlhHg9LZKjJM4JBjSPCXyPm9cuah7Ueku0uZrI5oZIGunwvKHpUUhS94iygXLt1JHsOw6SwhMPcxXVqHagZ6eB0yWigGoBqkTXbotjAnlKt1YHQ6MApoBpIn3qQn/3W199Tt/lMS1a7bm5hyVPyp9YUfCczUzQBa0SkR5Eddm1D3ByVxCnixw6xi1gsCcI3iSi1kc46KYWg8wk+E99Zm8XBOwZ3nxgAu1LsANM2p12GydHCHx7nDG/GRMIB3/c8F2Eg+tJ1EK6UtUn4pE8N2p/ykNGT2NjO+gNQboLWR8yB7DhFUkZh/BkYCLYvo8rwX76FPY1TwgsDKsjzaiRYiTYXu6C2OACrxHBqDU35qhEBnXx8cj6wssEmLv/7KjGy1kZ8ovFgNEpfcktlpG4Pm9fB0eXa0JdM0D5pt5AI8m5fle6gjTHUz0Z57yYjxFOQJQ5Zk1wsfcET4uX03AD2krDfrCO0lCL/Zx4WGANOqLa69OQlxdSYgrO6Ds4datJXBoCTiU8UE9zQTBY005CuyoD73ggXUcBbSrtFCWnvoYif/bUmKfHBHdWkHwueKeMe5eHNKUi8sTdy8HimeAgjvYFqTpY1ZmCsM2ywo8Plri8wP9xkF32Jux/wXm7Sowl3OBiTyuSGA+D63bUaA2XuDlbSTOGySweIEObu1AmveYCQkWvqj0MCTlNfe7GCCpwJcJRb+LjZYQuHCwwH8xVOJuPup7l4A9JbCHBBhOcYLEcyMkHhgsMXmF9ISft589Xa6V45dctFoPywfqKGYEaLVTLqLqi0rPilalu9sP9zoOAzsEtlhSYOwyAuOXFRi1tMC6/QU6UwawssjSZm+h1T62Wj4FsjFAmg6F5QlLi0Pa/GnzNSHAAEl1RN2PSk97v1UE6+d/CzdfHLLmz4ueaCdLG4G82RigryLtw6fN19eQh7iDZd20bvdbHA2LQlI/syJlfdM84XnTUmZuC/K2HVYuLK0oBOu2/1ttL6583L2sKLKurOjNtlMg/wiQ9GBJ94tC2nbiiDYsrWhkacPtq1vWvW4HeqKNnoL7LIHrZAZwCyelJ91zkSVvX0Sw/+6zuPfc+18hGXneWQbBkcwALkIqyXS/VbgP5/62iqh6otLDkCVvFKLqcNPd6y8K+FxFPlsEnRTPAL2NdvUvyweJeNnx6COT0d5Gt3fW5nfC+W9mBmgXMhFLi+jJttIiDdPE3fsiIIuQKQjZGKBdnWtXvXFopU31oSKkk1uve90OZGmjlbzu9cIM8yzZGGBhRKqPFkHMWZCqnRDYcnnLp0E76m5Hna0iR5+SGSBHpX0KQUmd9Vmy5o9DnrrylGkFPd0e4bZZtEBIqCeZAeIQV3ncvTAwf5YywbxZyqWBW18rTJQXrbSTt2yecnnK9BWkmgTH6bpFPnwrddmyrdTRCuLajbuXBkU+W5pvlnS/ryOp/879ZAaIgn2ZSQ3mQTvqXFjQV549atTrK/0rCPkZoC+hr3yUnupHO9uxdfdEGz2B0La6mLs1BgitPAELszRJ6m+DeCLUxiKRti9FI+nZFjIGys8AUZ1getS9NOiJF9hTSHoGhmrJkt9FWP6wtLj0JCQRfCNfG9qIqy/uXgbkZ4CeRtwDx91Lcz8O9uNkraO3GDmMEMPS0iCqXFhaTyGq7aj0KJj8fZcBsj7Qworm58y2NbIn0dzX7EhbR1Q+mx51PyOyM0CehvOUaRW90WZfRNx7CLsXllY00rQRmydCZUpCSJ3ZGSAPQhruVST1J+l+HLKWTZs/LJ9NC7sXzGPh3osqG5ZWNOLaUPcymmHd9KRrg4WHAYqoI4i09bn53Ot2oCfaIBrt5JCoLNsT/YxqI2t6BLIzQJoGbJ40ecOQt1xPIKxvlhjC7i10SDnpD72fg5HaibA+OmnZGaAouKavsM72RRTdz6Lry4NufQgEsUrTtzR5ioTbnnsdhhhaa40B0jSeF8G687bDcsGPmaaesHxumr4Ot9a4edMgLn/cvTAEn9e95+aJQpLp130X7v0wFJ2vFQTaKI4Bcnc84WUXjZ5qJwpp23fzuVIsCm65VlF0fX0MrTFAElp5ebasy2Rp6lR5UhJMEqLai0qPypMmf1y+RnrEc7nl3Ou8KKqeNHDbCn5v915aJJTTDJCQqWXkrT9vuSgk1dfqy24Hgn1SiGCAOHSrI0f53kDjeUPuxcF1L0lAe0eAopD1JaRBO+oMQ5p20uSJyp+1rItWy/cGovoclR4Gk3fhYIAo5JEQvY0s/c2S9ytEw32PAbrpzgBuxqT0VpGVgLPk7W1EPVtYWhQi82Y0VbYbPdUHtx33Og4ReZNHgIiChSGKUKKQlNclDPc3CWnzxaGIOiyS6kq6nxauWbeoetOgJ9tyEM8AYR0rmmCLRpINOyvSPG/S/b6M3uh7b7QZgWgGaLWTrZYPIq6uOAKNSs+CvHVkKefmda8XBvR0n8PaC0tLuB/NAF90uC/DvU6LrOVs/qzlwupISrPpUffcfG5aHMLyh6X1NTh9jGeAVh8orHxYWtFI1UYL9vBU9ccgT/mwMguLTT+IsOeIQjBvWkbOiHgGaAeyPkTW/FnQat1pyoflCUuLS8+ax0WeMnFwCdO93y60oa1oBmhDY7HI0l6WvD0Nt2/udWr0Qeke9ixhaXmRp66wMklpgf+KAWa7mSORsMwc1vAXFVmeNUveJBRZVxSi2oggokLRrnojQNr3XjOc8BX6GEzsyi8devC5X/t/URYJf4r7BaUAAAAASUVORK5CYII="
              alt="VigilAMC"
              width="48"
              height="48"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                objectFit: 'cover',
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '24px', fontWeight: 800, color: '#1C1917' }}>
                Vigil<span style={{ color: '#EA580C' }}>AMC</span>
              </span>
              <span style={{ fontSize: '14px', color: '#44403C' }}>
                Fire safety AMC software - tracked, proven, reported.
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '15px',
              fontWeight: 700,
              color: '#FAFAF9',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '10px',
                backgroundColor: '#1C1917',
                border: '1px solid #C2410C',
                color: '#FAFAF9',
              }}
            >
              <span>190 Hrs &amp; Rs.96,000 Saved / Year</span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
